import { addHours } from "date-fns";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getPlan, roiPercent } from "@/lib/plans";
import { sendEmail } from "@/lib/email/send";
import { emails } from "@/lib/email/templates";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const { planSlug } = await request.json();
    const plan = getPlan(planSlug);
    if (!plan) return NextResponse.json({ error: "Invalid investment plan." }, { status: 400 });

    const { data: profile } = await supabase.from("profiles").select("balance,full_name,email").eq("id", user.id).single();
    if (Number(profile?.balance || 0) < plan.invest) return NextResponse.json({ error: "Insufficient balance. Please deposit funds first." }, { status: 400 });

    const startDate = new Date();
    const endDate = addHours(startDate, plan.durationHours);

    const { error: debitError } = await supabase.rpc("increment_user_balance", { p_user_id: user.id, p_amount: -plan.invest });
    if (debitError) return NextResponse.json({ error: debitError.message }, { status: 400 });

    const { data, error } = await supabase.from("investments").insert({
      user_id: user.id,
      plan_slug: plan.slug,
      plan_name: plan.name,
      amount: plan.invest,
      expected_profit: plan.profit,
      return_amount: plan.returnAmount,
      roi_percent: Number(roiPercent(plan).toFixed(2)),
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: "ACTIVE"
    }).select("*").single();

    if (error) {
      await supabase.rpc("increment_user_balance", { p_user_id: user.id, p_amount: plan.invest });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("transactions").insert({ user_id: user.id, type: "INVESTMENT", amount: plan.invest, asset: "USD", status: "COMPLETED", reference: data.id });
    await sendEmail({ to: user.email!, subject: "Investment created", html: emails.investmentCreated(profile?.full_name || "Investor", plan.name, plan.invest, plan.profit) });

    return NextResponse.json({ ok: true, investment: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Investment creation failed." }, { status: 400 });
  }
}
