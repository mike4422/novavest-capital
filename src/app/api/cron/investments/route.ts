import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { emails } from "@/lib/email/templates";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization") || "";
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: matured, error } = await admin
    .from("investments")
    .select("*, profiles(full_name,email)")
    .eq("status", "ACTIVE")
    .lte("end_date", new Date().toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  for (const investment of matured || []) {
    await admin.from("investments").update({ status: "COMPLETED", completed_at: new Date().toISOString() }).eq("id", investment.id);
    await admin.rpc("increment_user_balance", { p_user_id: investment.user_id, p_amount: investment.return_amount });
    await admin.from("transactions").insert({ user_id: investment.user_id, type: "PAYOUT", amount: investment.return_amount, asset: "USD", status: "COMPLETED", reference: investment.id });
    await admin.from("notifications").insert({ user_id: investment.user_id, title: "Investment completed", message: `${investment.plan_name} completed and returns were credited.`, type: "INVESTMENT" });
    await sendEmail({ to: investment.profiles.email, subject: "Investment completed", html: emails.investmentCompleted(investment.profiles.full_name, investment.plan_name, Number(investment.return_amount)) });
  }

  await admin.from("activity_logs").insert({ action: "CRON_INVESTMENTS_COMPLETED", metadata: { count: matured?.length || 0 } });
  return NextResponse.json({ ok: true, completed: matured?.length || 0 });
}
