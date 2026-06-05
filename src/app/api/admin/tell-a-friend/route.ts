import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    
    // Fetch the Tell A Friend template configuration
    const { data, error } = await admin.from("settings").select("value").eq("key", "tell_a_friend_template").single();
    
    // If it doesn't exist yet, return a highly converting default structure
    if (error || !data) {
      return NextResponse.json({ 
        ok: true, 
        settings: {
          enabled: true,
          subject: "Invitation to join NovaVest Capital",
          message: "Hi there!\n\I have been using NovaVest Capital to grow my portfolio, and I thought you might be interested in checking it out. They offer great daily returns and a very secure platform.\n\nYou can sign up using my invite link here:\n{REF_LINK}\n\nBest regards,\n{USER_NAME}"
        } 
      });
    }
    
    return NextResponse.json({ ok: true, settings: data.value });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch tell a friend settings." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const settings = await request.json(); 

    if (!settings || !settings.subject) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    // Upsert the template into the database
    const { error } = await admin.from("settings").upsert({
      key: "tell_a_friend_template",
      value: settings,
      updated_at: new Date().toISOString()
    }, { onConflict: "key" });
      
    if (error) throw error;

    // Log the administrative action
    await admin.from("activity_logs").insert({
      action: "TELL_A_FRIEND_UPDATED",
      metadata: { updated: true }
    });

    return NextResponse.json({ ok: true, message: "Invitation template saved successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save template." }, { status: 500 });
  }
}