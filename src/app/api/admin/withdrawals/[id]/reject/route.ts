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
    const { data: withdrawal, error } = await admin.from("withdrawals").select("*, profiles(full_name,email)").eq("id", id).single();
    if (error || !withdrawal) return NextResponse.json({ error: error?.message || "Withdrawal not found." }, { status: 404 });
    if (withdrawal.status !== "PENDING_REVIEW") return NextResponse.json({ error: "Withdrawal already reviewed." }, { status: 400 });

    await admin.from("withdrawals").update({ status: "REJECTED", reviewed_by: adminUser.id, reviewed_at: new Date().toISOString() }).eq("id", id);
    await admin.rpc("increment_user_balance", { p_user_id: withdrawal.user_id, p_amount: withdrawal.amount });
    await admin.from("transactions").update({ status: "FAILED" }).eq("reference", id).eq("type", "WITHDRAWAL");
    await admin.from("activity_logs").insert({ actor_id: adminUser.id, action: "WITHDRAWAL_REJECTED", metadata: { withdrawal_id: id, amount: withdrawal.amount, refunded: true } });
    await sendEmail({ to: withdrawal.profiles.email, subject: "Withdrawal rejected", html: emails.withdrawalStatus(withdrawal.profiles.full_name, Number(withdrawal.amount), "REJECTED") });

    return NextResponse.json({ ok: true, message: "Withdrawal rejected and balance refunded." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Rejection failed." }, { status: 400 });
  }
}
