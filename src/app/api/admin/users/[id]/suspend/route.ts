import { NextResponse } from "next/server";
import { assertAdminFromRequest } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminUser = await assertAdminFromRequest();
  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ status: "SUSPENDED" }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await admin.from("activity_logs").insert({ actor_id: adminUser.id, action: "USER_SUSPENDED", metadata: { user_id: id } });
  return NextResponse.json({ ok: true });
}
