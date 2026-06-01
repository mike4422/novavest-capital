import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withdrawalSchema } from "@/lib/validators";
import { sendAdminEmail, sendEmail } from "@/lib/email/send";
import { emails } from "@/lib/email/templates";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const body = withdrawalSchema.parse(await request.json());
    const { data: profile } = await supabase.from("profiles").select("balance,full_name,email").eq("id", user.id).single();
    if (Number(profile?.balance || 0) < body.amount) return NextResponse.json({ error: "Insufficient balance." }, { status: 400 });

    const { error: debitError } = await supabase.rpc("increment_user_balance", { p_user_id: user.id, p_amount: -body.amount });
    if (debitError) return NextResponse.json({ error: debitError.message }, { status: 400 });

    const { data, error } = await supabase.from("withdrawals").insert({
      user_id: user.id,
      amount: body.amount,
      asset: body.asset,
      network: body.network,
      wallet_address: body.walletAddress,
      status: "PENDING_REVIEW"
    }).select("*").single();

    if (error) {
      await supabase.rpc("increment_user_balance", { p_user_id: user.id, p_amount: body.amount });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("transactions").insert({ user_id: user.id, type: "WITHDRAWAL", amount: body.amount, asset: body.asset, status: "PENDING", reference: data.id });
    await sendEmail({ to: user.email!, subject: "Withdrawal request received", html: emails.withdrawalSubmitted(profile?.full_name || "Investor", body.amount) });
    await sendAdminEmail("New withdrawal request", emails.adminWithdrawal(user.email!, body.amount, body.walletAddress));

    return NextResponse.json({ ok: true, withdrawal: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Withdrawal request failed." }, { status: 400 });
  }
}
