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
    if (deposit.status !== "PENDING_REVIEW") return NextResponse.json({ error: "Deposit already reviewed." }, { status: 400 });

    await admin.from("deposits").update({ status: "APPROVED", reviewed_by: adminUser.id, reviewed_at: new Date().toISOString() }).eq("id", id);
    await admin.rpc("increment_user_balance", { p_user_id: deposit.user_id, p_amount: deposit.amount });
    await admin.from("transactions").update({ status: "COMPLETED" }).eq("reference", id).eq("type", "DEPOSIT");
    await admin.from("notifications").insert({ user_id: deposit.user_id, title: "Deposit approved", message: `Your deposit of $${deposit.amount} has been approved.`, type: "DEPOSIT" });
    await admin.from("activity_logs").insert({ actor_id: adminUser.id, action: "DEPOSIT_APPROVED", metadata: { deposit_id: id, amount: deposit.amount } });
    await sendEmail({ to: deposit.profiles.email, subject: "Deposit approved", html: emails.depositStatus(deposit.profiles.full_name, Number(deposit.amount), "APPROVED") });

    return NextResponse.json({ ok: true, message: "Deposit approved." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Approval failed." }, { status: 400 });
  }
}
