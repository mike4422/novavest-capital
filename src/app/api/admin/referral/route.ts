import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const { userId, uplineIdentifier, action } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Target user ID is required." }, { status: 400 });
    }

    if (action === "DISCONNECT") {
      // Remove the upline
      const { error } = await admin.from("profiles").update({ referred_by: null }).eq("id", userId);
      if (error) throw error;
      
      await admin.from("activity_logs").insert({ action: "UPLINE_REMOVED", metadata: { userId } });
      return NextResponse.json({ ok: true, message: "Upline successfully removed." });
    }

    if (!uplineIdentifier) {
      return NextResponse.json({ error: "Upline email or referral code is required." }, { status: 400 });
    }

    // Find the upline user by email or exact referral code
    const { data: upline, error: uplineError } = await admin
      .from("profiles")
      .select("id, full_name")
      .or(`email.ilike.${uplineIdentifier},referral_code.eq.${uplineIdentifier}`)
      .single();

    if (uplineError || !upline) {
      return NextResponse.json({ error: "Could not find an upline with that email or code." }, { status: 404 });
    }

    if (upline.id === userId) {
      return NextResponse.json({ error: "A user cannot be their own upline." }, { status: 400 });
    }

    // Connect the accounts
    const { error: updateError } = await admin.from("profiles").update({ referred_by: upline.id }).eq("id", userId);
    if (updateError) throw updateError;

    // Log the administrative action
    await admin.from("activity_logs").insert({
      action: "UPLINE_ASSIGNED",
      metadata: { downlineId: userId, uplineId: upline.id }
    });

    return NextResponse.json({ 
      ok: true, 
      message: `Successfully connected user to upline: ${upline.full_name}` 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update referral connection." }, { status: 500 });
  }
}