import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/email/send";
import { emails } from "@/lib/email/templates";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const body = await request.json();
    
    const { userId, amount, description, type } = body;

    if (!userId || !amount) {
      return NextResponse.json({ error: "User ID and Amount are required." }, { status: 400 });
    }

    const numericAmount = type === 'PENALTY' ? -Math.abs(Number(amount)) : Math.abs(Number(amount));

    // Fetch user details for the email
    const { data: userProfile } = await admin.from("profiles").select("email, full_name").eq("id", userId).single();
    if (!userProfile) throw new Error("User not found.");

    // Increment/decrement balance
    const { error: rpcError } = await admin.rpc("increment_user_balance", { 
      p_user_id: userId, 
      p_amount: numericAmount 
    });
    if (rpcError) throw new Error(rpcError.message);

    // Log transaction
    await admin.from("transactions").insert({
      user_id: userId, type: type, amount: Math.abs(numericAmount), asset: "USD",
      status: "COMPLETED", reference: "ADMIN_MANUAL", metadata: { description }
    });

    // In-app notification
    await admin.from("notifications").insert({
      user_id: userId, title: type === 'BONUS' ? "Bonus Received" : "Balance Adjusted", message: description || `Your account balance was adjusted by $${Math.abs(numericAmount)}.`, type: "SYSTEM"
    });

    // Send Real Email
    if (userProfile.email) {
      await sendEmail({
        to: userProfile.email,
        subject: type === 'BONUS' ? "Bonus Received" : "Balance Adjusted",
        html: emails.balanceAdjusted(userProfile.full_name, Math.abs(numericAmount), type, description || "Administrative adjustment")
      });
    }

    return NextResponse.json({ ok: true, message: "Balance updated successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process bonus." }, { status: 500 });
  }
}