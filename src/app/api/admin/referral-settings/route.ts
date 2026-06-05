import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    
    // Fetch the referral settings configuration
    const { data, error } = await admin.from("settings").select("value").eq("key", "referral_settings").single();
    
    // If it doesn't exist yet, return a default structure (3 levels)
    if (error || !data) {
      return NextResponse.json({ 
        ok: true, 
        settings: {
          enabled: true,
          requireActiveDeposit: false,
          signupBonus: 0,
          levels: [5, 2, 1] // Level 1: 5%, Level 2: 2%, Level 3: 1%
        } 
      });
    }
    
    return NextResponse.json({ ok: true, settings: data.value });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch referral settings." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const settings = await request.json(); 

    if (!settings || !Array.isArray(settings.levels)) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    // Upsert the referral settings into the database
    const { error } = await admin.from("settings").upsert({
      key: "referral_settings",
      value: settings,
      updated_at: new Date().toISOString()
    }, { onConflict: "key" });
      
    if (error) throw error;

    // Log the administrative action for security audits
    await admin.from("activity_logs").insert({
      action: "REFERRAL_SETTINGS_UPDATED",
      metadata: { levels: settings.levels.length }
    });

    return NextResponse.json({ ok: true, message: "Referral settings saved successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save referral settings." }, { status: 500 });
  }
}