import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const { userId, fromAsset, toAsset, amount, rate, fee } = await request.json();

    if (!userId || !amount || !fromAsset || !toAsset) {
      return NextResponse.json({ error: "Missing required exchange parameters." }, { status: 400 });
    }

    const numericAmount = Math.abs(Number(amount));
    const convertedAmount = numericAmount * Number(rate);
    const finalAmount = convertedAmount - Number(fee || 0);

    // Record the exchange in the transactions ledger
    const { error: txError } = await admin.from("transactions").insert({
      user_id: userId,
      type: "EXCHANGE",
      amount: numericAmount,
      asset: fromAsset, // The asset they started with
      status: "COMPLETED",
      reference: `SWAP_${fromAsset}_${toAsset}`,
      metadata: { 
        to_asset: toAsset,
        exchange_rate: rate,
        converted_amount: convertedAmount,
        fee_deducted: fee,
        final_received: finalAmount,
        description: `Exchanged ${numericAmount} ${fromAsset} to ${finalAmount.toFixed(6)} ${toAsset}`
      }
    });

    if (txError) throw new Error(txError.message);

    // Log the administrative action
    await admin.from("activity_logs").insert({
      action: "ADMIN_LOGGED_EXCHANGE",
      metadata: { userId, fromAsset, toAsset, amount: numericAmount }
    });

    return NextResponse.json({ 
      ok: true, 
      message: `Successfully logged exchange: ${numericAmount} ${fromAsset} -> ${finalAmount.toFixed(6)} ${toAsset}` 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process exchange." }, { status: 500 });
  }
}