import { NextResponse } from "next/server";
import { assertAdminFromRequest } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    await assertAdminFromRequest();
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("support_conversations")
      .select("id,user_id,guest_name,guest_email,subject,status,last_message_at,created_at,updated_at")
      .order("last_message_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json({ conversations: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unable to load support conversations." }, { status: error.status || 500 });
  }
}
