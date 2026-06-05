import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    
    // Fetch the maintenance page configuration
    const { data, error } = await admin.from("settings").select("value").eq("key", "maintenance_page").single();
    
    // If it doesn't exist yet, return a safe default structure
    if (error || !data) {
      return NextResponse.json({ 
        ok: true, 
        settings: {
          title: "System Maintenance",
          message: "We are currently performing scheduled upgrades to improve our platform infrastructure. We appreciate your patience and will be back online shortly.",
          estimatedCompletion: "",
          showSupportEmail: true
        } 
      });
    }
    
    return NextResponse.json({ ok: true, settings: data.value });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch maintenance page settings." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const settings = await request.json(); 

    if (!settings || !settings.title) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    // Upsert the maintenance page content into the database
    const { error } = await admin.from("settings").upsert({
      key: "maintenance_page",
      value: settings,
      updated_at: new Date().toISOString()
    }, { onConflict: "key" });
      
    if (error) throw error;

    // Log the administrative action
    await admin.from("activity_logs").insert({
      action: "MAINTENANCE_PAGE_UPDATED",
      metadata: { updated: true }
    });

    return NextResponse.json({ ok: true, message: "Maintenance page content saved successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save maintenance page settings." }, { status: 500 });
  }
}