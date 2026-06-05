import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    
    // Fetch the security configuration
    const { data, error } = await admin.from("settings").select("value").eq("key", "security_settings").single();
    
    // If it doesn't exist yet, return a safe, restrictive default structure
    if (error || !data) {
      return NextResponse.json({ 
        ok: true, 
        settings: {
          requireEmailVerification: true,
          requireWithdrawal2FA: false,
          maxLoginAttempts: 5,
          sessionTimeoutMinutes: 60,
          adminIpWhitelist: ""
        } 
      });
    }
    
    return NextResponse.json({ ok: true, settings: data.value });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch security settings." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adminUser = await requireAdmin(); // We need their info just in case they lock themselves out
    const admin = createAdminClient();
    const settings = await request.json(); 

    if (!settings) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    // Upsert the security settings into the database
    const { error } = await admin.from("settings").upsert({
      key: "security_settings",
      value: settings,
      updated_at: new Date().toISOString()
    }, { onConflict: "key" });
      
    if (error) throw error;

    // Log the administrative action for security audits
    await admin.from("activity_logs").insert({
      action: "GLOBAL_SECURITY_UPDATED",
      metadata: { admin: adminUser.user.email, timestamp: new Date().toISOString() }
    });

    return NextResponse.json({ ok: true, message: "Security policies saved successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save security settings." }, { status: 500 });
  }
}