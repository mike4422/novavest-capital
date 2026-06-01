import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { depositSchema } from "@/lib/validators";
import { sendAdminEmail, sendEmail } from "@/lib/email/send";
import { emails } from "@/lib/email/templates";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const body = depositSchema.parse(await request.json());
    const { data: profile } = await supabase.from("profiles").select("full_name,email").eq("id", user.id).single();

    const { data, error } = await supabase.from("deposits").insert({
      user_id: user.id,
      amount: body.amount,
      asset: body.asset,
      network: body.network,
      proof_url: body.proofUrl,
      tx_hash: body.txHash,
      status: "PENDING_REVIEW"
    }).select("*").single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("transactions").insert({ user_id: user.id, type: "DEPOSIT", amount: body.amount, asset: body.asset, status: "PENDING", reference: data.id });
    await sendEmail({ to: user.email!, subject: "Deposit request received", html: emails.depositSubmitted(profile?.full_name || "Investor", body.amount, `${body.asset} ${body.network}`) });
    await sendAdminEmail("New deposit request", emails.adminDeposit(user.email!, body.amount, `${body.asset} ${body.network}`));

    return NextResponse.json({ ok: true, deposit: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Deposit request failed." }, { status: 400 });
  }
}
