import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    
    // Fetch the auto-withdrawal configuration
    const { data, error } = await admin.from("settings").select("value").eq("key", "auto_withdrawals").single();
    
    // If it doesn't exist yet, return a safe default structure
    if (error || !data) {
      return NextResponse.json({ 
        ok: true, 
        settings: {
          enabled: false, // Default to completely disabled for safety
          maxAutoAmount: 50, // Anything over $50 goes to manual review
          maxDailyRequests: 2 // Max 2 auto-withdrawals per user per day
        } 
      });
    }
    
    return NextResponse.json({ ok: true, settings: data.value });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch auto-withdrawal settings." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const settings = await request.json(); 

    if (!settings || typeof settings.enabled !== "boolean") {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    // Upsert the auto-withdrawal settings into the database
    const { error } = await admin.from("settings").upsert({
      key: "auto_withdrawals",
      value: settings,
      updated_at: new Date().toISOString()
    }, { onConflict: "key" });
      
    if (error) throw error;

    // Log the administrative action for security audits
    await admin.from("activity_logs").insert({
      action: "AUTO_WITHDRAWALS_UPDATED",
      metadata: { enabled: settings.enabled, limit: settings.maxAutoAmount }
    });

    return NextResponse.json({ ok: true, message: "Auto-withdrawal settings saved successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save auto-withdrawal settings." }, { status: 500 });
  }
}