import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    
    // Fetch the info box configuration
    const { data, error } = await admin.from("settings").select("value").eq("key", "info_box_settings").single();
    
    // If it doesn't exist yet, return a safe default structure
    if (error || !data) {
      return NextResponse.json({ 
        ok: true, 
        settings: {
          enabled: false,
          title: "System Update",
          message: "Welcome to the new dashboard.",
          type: "info" // Can be info, warning, success, or promo
        } 
      });
    }
    
    return NextResponse.json({ ok: true, settings: data.value });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch info box settings." }, { status: 500 });
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

    // Upsert the info box settings into the database
    const { error } = await admin.from("settings").upsert({
      key: "info_box_settings",
      value: settings,
      updated_at: new Date().toISOString()
    }, { onConflict: "key" });
      
    if (error) throw error;

    // Log the administrative action for security audits
    await admin.from("activity_logs").insert({
      action: "INFO_BOX_UPDATED",
      metadata: { enabled: settings.enabled, type: settings.type }
    });

    return NextResponse.json({ ok: true, message: "Info box settings saved successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save info box settings." }, { status: 500 });
  }
}