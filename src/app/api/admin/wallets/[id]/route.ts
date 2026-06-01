import { NextResponse } from "next/server";
import { assertAdminFromRequest } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminUser = await assertAdminFromRequest();
    const { id } = await params;
    const body = await request.json();
    const admin = createAdminClient();
    const { error } = await admin.from("wallets").update({
      address: body.address,
      qr_code_url: body.qrCodeUrl,
      minimum_deposit: Number(body.minimumDeposit || 0),
      enabled: Boolean(body.enabled),
      updated_at: new Date().toISOString()
    }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await admin.from("activity_logs").insert({ actor_id: adminUser.id, action: "WALLET_UPDATED", metadata: { wallet_id: id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Wallet update failed." }, { status: 400 });
  }
}
