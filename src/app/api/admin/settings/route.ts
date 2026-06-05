import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    
    // Fetch all configuration keys from the settings table
    const { data, error } = await admin.from("settings").select("*");
    if (error) throw error;
    
    return NextResponse.json({ ok: true, settings: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch settings." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const updates = await request.json(); // Expects an array of { key, value } objects

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: "Invalid payload format." }, { status: 400 });
    }

    // Loop through the updates and upsert them into the database
    for (const update of updates) {
      const { error } = await admin.from("settings").upsert({
        key: update.key,
        value: update.value,
        updated_at: new Date().toISOString()
      }, { onConflict: "key" });
      
      if (error) throw error;
    }

    // Log the administrative action for security audits
    await admin.from("activity_logs").insert({
      action: "SYSTEM_SETTINGS_UPDATED",
      metadata: { keys_updated: updates.map(u => u.key) }
    });

    return NextResponse.json({ ok: true, message: "System settings saved successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save settings." }, { status: 500 });
  }
}