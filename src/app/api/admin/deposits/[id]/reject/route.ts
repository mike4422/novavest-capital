import { NextResponse } from "next/server";
import { assertAdminFromRequest } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { emails } from "@/lib/email/templates";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminUser = await assertAdminFromRequest();
    const { id } = await params;
    const admin = createAdminClient();
    const { data: deposit, error } = await admin.from("deposits").select("*, profiles(full_name,email)").eq("id", id).single();
    if (error || !deposit) return NextResponse.json({ error: error?.message || "Deposit not found." }, { status: 404 });
    await admin.from("deposits").update({ status: "REJECTED", reviewed_by: adminUser.id, reviewed_at: new Date().toISOString() }).eq("id", id);
    await admin.from("transactions").update({ status: "FAILED" }).eq("reference", id).eq("type", "DEPOSIT");
    await admin.from("activity_logs").insert({ actor_id: adminUser.id, action: "DEPOSIT_REJECTED", metadata: { deposit_id: id } });
    await sendEmail({ to: deposit.profiles.email, subject: "Deposit rejected", html: emails.depositStatus(deposit.profiles.full_name, Number(deposit.amount), "REJECTED") });
    return NextResponse.json({ ok: true, message: "Deposit rejected." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Rejection failed." }, { status: 400 });
  }
}
