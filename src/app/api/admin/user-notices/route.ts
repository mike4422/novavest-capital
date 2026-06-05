import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    
    // Fetch the 50 most recent notices
    const { data, error } = await admin
      .from("notifications")
      .select("id, title, message, type, created_at, user_id, profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(50);
      
    if (error) {
      // If the table doesn't exist yet, we catch it gracefully
      if (error.code === '42P01') {
        return NextResponse.json({ ok: true, notices: [], warning: "Notifications table missing." });
      }
      throw error;
    }
    
    return NextResponse.json({ ok: true, notices: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch notices." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const { target, userId, title, message, type } = await request.json();

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required." }, { status: 400 });
    }

    if (target === "SPECIFIC" && !userId) {
      return NextResponse.json({ error: "You must select a user when targeting a specific account." }, { status: 400 });
    }

    // Insert the notification
    // Note: user_id = null represents a global broadcast to all users
    const { error } = await admin.from("notifications").insert({
      user_id: target === "ALL" ? null : userId,
      title,
      message,
      type: type || 'info'
    });

    if (error) throw error;

    // Log the administrative action for security audits
    await admin.from("activity_logs").insert({
      action: "USER_NOTICE_SENT",
      metadata: { target, title }
    });

    return NextResponse.json({ ok: true, message: "Notice dispatched successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send notice." }, { status: 500 });
  }
}