import { NextResponse } from "next/server";
import { assertAdminFromRequest } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminUser = await assertAdminFromRequest();
    const { id } = await params;
    const { amount, direction } = await request.json();
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    const admin = createAdminClient();
    const signedAmount = direction === "remove" ? -numeric : numeric;
    const { error } = await admin.rpc("increment_user_balance", { p_user_id: id, p_amount: signedAmount });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await admin.from("transactions").insert({ user_id: id, type: direction === "remove" ? "ADMIN_DEBIT" : "ADMIN_CREDIT", amount: numeric, asset: "USD", status: "COMPLETED", reference: crypto.randomUUID() });
    await admin.from("activity_logs").insert({ actor_id: adminUser.id, action: "BALANCE_UPDATED", metadata: { user_id: id, amount: signedAmount } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Balance update failed." }, { status: 400 });
  }
}
