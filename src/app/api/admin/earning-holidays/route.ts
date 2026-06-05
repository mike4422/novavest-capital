import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    
    // Fetch the earning holidays configuration
    const { data, error } = await admin.from("settings").select("value").eq("key", "earning_holidays").single();
    
    // If it doesn't exist yet, return a safe default structure
    if (error || !data) {
      return NextResponse.json({ 
        ok: true, 
        settings: {
          pauseOnWeekends: false,
          specificDates: [] // Array of { date: "YYYY-MM-DD", reason: "Christmas" }
        } 
      });
    }
    
    return NextResponse.json({ ok: true, settings: data.value });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch earning holidays." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const settings = await request.json(); 

    if (!settings || typeof settings.pauseOnWeekends !== "boolean") {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    // Upsert the earning holidays settings into the database
    const { error } = await admin.from("settings").upsert({
      key: "earning_holidays",
      value: settings,
      updated_at: new Date().toISOString()
    }, { onConflict: "key" });
      
    if (error) throw error;

    // Log the administrative action for security audits
    await admin.from("activity_logs").insert({
      action: "EARNING_HOLIDAYS_UPDATED",
      metadata: { weekendsPaused: settings.pauseOnWeekends, holidayCount: settings.specificDates.length }
    });

    return NextResponse.json({ ok: true, message: "Earning holidays saved successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save earning holidays." }, { status: 500 });
  }
}