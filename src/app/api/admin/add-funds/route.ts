import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/email/send";
import { emails } from "@/lib/email/templates";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const { userId, amount, description } = await request.json();

    if (!userId || !amount) {
      return NextResponse.json({ error: "User ID and Amount are required." }, { status: 400 });
    }

    const fundAmount = Math.abs(Number(amount));

    // Fetch user details for the email
    const { data: userProfile } = await admin.from("profiles").select("email, full_name").eq("id", userId).single();
    if (!userProfile) throw new Error("User not found.");

    // Increment balance
    const { error: rpcError } = await admin.rpc("increment_user_balance", { 
      p_user_id: userId, 
      p_amount: fundAmount 
    });
    if (rpcError) throw new Error(rpcError.message);

    // Log transaction
    await admin.from("transactions").insert({
      user_id: userId, type: "DEPOSIT", amount: fundAmount, asset: "USD",
      status: "COMPLETED", reference: "ADMIN_FUNDED", metadata: { description: description || "Admin manually added funds" }
    });

    // Log activity
    await admin.from("activity_logs").insert({ action: "ADMIN_ADDED_FUNDS", metadata: { userId, amount: fundAmount, description } });

    // In-app notification
    await admin.from("notifications").insert({
      user_id: userId, title: "Account Funded", message: description || `Your account was successfully funded with $${fundAmount}.`, type: "SYSTEM"
    });

    // Send Real Email
    if (userProfile.email) {
      await sendEmail({
        to: userProfile.email,
        subject: "Account Funded",
        html: emails.fundsAdded(userProfile.full_name, fundAmount, description || "Admin manually added funds")
      });
    }

    return NextResponse.json({ ok: true, message: `Successfully added $${fundAmount} to user balance.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to add funds." }, { status: 500 });
  }
}