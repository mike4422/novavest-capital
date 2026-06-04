import { NextResponse } from "next/server";
import { assertAdminFromRequest } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";

function userReplyHtml(message: string) {
  const safeMessage = message.replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c] || c));
  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#020617;padding:28px;color:#e2e8f0">
      <div style="max-width:640px;margin:auto;border:1px solid rgba(255,255,255,.12);border-radius:24px;background:linear-gradient(135deg,rgba(15,23,42,.96),rgba(30,41,59,.88));padding:28px">
        <p style="margin:0;color:#5eead4;font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:12px">NovaVest Support</p>
        <h1 style="margin:10px 0 8px;font-size:26px;color:#fff">Support team reply</h1>
        <p style="margin:0 0 18px;color:#94a3b8">Our support team has replied to your message.</p>
        <div style="border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:16px;background:rgba(255,255,255,.04)">
          <p style="white-space:pre-wrap;color:#f8fafc">${safeMessage}</p>
        </div>
      </div>
    </div>`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminFromRequest();
    const { id } = await params;
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("support_messages")
      .select("id,conversation_id,sender_type,sender_id,message,created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ messages: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unable to load messages." }, { status: error.status || 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await assertAdminFromRequest();
    const { id } = await params;
    const body = await request.json();
    const message = String(body.message || "").trim();

    if (!message) {
      return NextResponse.json({ error: "Reply message is required." }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: conversation, error: conversationError } = await admin
      .from("support_conversations")
      .select("id,guest_email,guest_name,user_id")
      .eq("id", id)
      .maybeSingle();

    if (conversationError) throw conversationError;
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    const { data: saved, error } = await admin
      .from("support_messages")
      .insert({
        conversation_id: id,
        sender_type: "ADMIN",
        sender_id: user.id,
        message
      })
      .select("id,conversation_id,sender_type,sender_id,message,created_at")
      .single();

    if (error) throw error;

    await admin
      .from("support_conversations")
      .update({ status: "PENDING_USER", last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", id);

    await admin.from("activity_logs").insert({
      actor_id: user.id,
      action: "support.admin.reply",
      metadata: { conversationId: id }
    });

    if (conversation.guest_email) {
      sendEmail({
        to: conversation.guest_email,
        subject: "NovaVest Support replied to your message",
        html: userReplyHtml(message)
      }).catch((error) => console.error("Support reply email failed:", error));
    }

    return NextResponse.json({ message: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unable to send admin reply." }, { status: error.status || 500 });
  }
}
