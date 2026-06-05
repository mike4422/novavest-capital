import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    
    const { data, error } = await admin.from("email_templates").select("*");
    if (error) throw error;
    
    return NextResponse.json({ ok: true, templates: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch templates." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const body = await request.json();
    
    const { trigger_name, subject, body_html, variables } = body;

    if (!trigger_name || !subject || !body_html) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Upsert means it will update the row if trigger_name exists, or insert it if it's new
    const { error } = await admin.from("email_templates").upsert({
      trigger_name,
      subject,
      body_html,
      variables,
      updated_at: new Date().toISOString()
    }, { onConflict: "trigger_name" });

    if (error) throw error;

    return NextResponse.json({ ok: true, message: "Template saved successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save template." }, { status: 500 });
  }
}