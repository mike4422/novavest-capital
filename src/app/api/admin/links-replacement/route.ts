import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    
    // Fetch the links replacement configuration
    const { data, error } = await admin.from("settings").select("value").eq("key", "links_replacement").single();
    
    // If it doesn't exist yet, return a safe default structure
    if (error || !data) {
      return NextResponse.json({ 
        ok: true, 
        settings: {
          telegram: "",
          whatsapp: "",
          twitter: "",
          facebook: "",
          instagram: "",
          supportEmail: "",
          iosApp: "",
          androidApp: ""
        } 
      });
    }
    
    return NextResponse.json({ ok: true, settings: data.value });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch replacement links." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const settings = await request.json(); 

    if (!settings) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    // Upsert the links configuration into the database
    const { error } = await admin.from("settings").upsert({
      key: "links_replacement",
      value: settings,
      updated_at: new Date().toISOString()
    }, { onConflict: "key" });
      
    if (error) throw error;

    // Log the administrative action for security audits
    await admin.from("activity_logs").insert({
      action: "LINKS_REPLACEMENT_UPDATED",
      metadata: { updated: true }
    });

    return NextResponse.json({ ok: true, message: "Global links saved successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save links." }, { status: 500 });
  }
}