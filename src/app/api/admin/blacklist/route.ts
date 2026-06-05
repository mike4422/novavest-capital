import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Verify admin privileges
    await requireAdmin();
    const admin = createAdminClient();
    const body = await request.json();
    
    const { userId, action, reason } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: "User ID and action are required." }, { status: 400 });
    }

    // Determine the new status
    const newStatus = action === "BAN" ? "SUSPENDED" : "ACTIVE";

    // Update the user's profile status
    const { error: updateError } = await admin
      .from("profiles")
      .update({ status: newStatus })
      .eq("id", userId);

    if (updateError) throw new Error(updateError.message);

    // Log the security action
    await admin.from("activity_logs").insert({
      action: action === "BAN" ? "USER_BLACKLISTED" : "USER_UNBANNED",
      metadata: { userId, reason: reason || "No reason provided", timestamp: new Date().toISOString() }
    });

    // Optional: If you want to automatically log them out when banned, 
    // you would delete their active sessions here.

    return NextResponse.json({ 
      ok: true, 
      message: action === "BAN" ? "User has been blacklisted." : "User access restored." 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user status." }, { status: 500 });
  }
}