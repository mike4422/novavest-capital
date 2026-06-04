import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAdminEmail } from "@/lib/email/send";

function supportEmailHtml({ name, email, message }: { name: string; email: string; message: string }) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#020617;padding:28px;color:#e2e8f0">
      <div style="max-width:640px;margin:auto;border:1px solid rgba(255,255,255,.12);border-radius:24px;background:linear-gradient(135deg,rgba(15,23,42,.96),rgba(30,41,59,.88));padding:28px">
        <p style="margin:0;color:#5eead4;font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:12px">NovaVest Support</p>
        <h1 style="margin:10px 0 8px;font-size:26px;color:#fff">New support message</h1>
        <p style="margin:0 0 18px;color:#94a3b8">A visitor or investor sent a new message from the Nova AI support widget.</p>
        <div style="border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:16px;background:rgba(255,255,255,.04)">
          <p style="margin:0 0 8px"><strong>Name:</strong> ${name}</p>
          <p style="margin:0 0 8px"><strong>Email:</strong> ${email}</p>
          <p style="margin:0"><strong>Message:</strong></p>
          <p style="white-space:pre-wrap;color:#f8fafc">${message.replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c] || c))}</p>
        </div>
      </div>
    </div>`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");
  const visitorToken = searchParams.get("visitorToken");

  if (!conversationId || !visitorToken) {
    return NextResponse.json({ messages: [] });
  }

  const admin = createAdminClient();
  const { data: conversation, error: conversationError } = await admin
    .from("support_conversations")
    .select("id, visitor_token")
    .eq("id", conversationId)
    .eq("visitor_token", visitorToken)
    .maybeSingle();

  if (conversationError || !conversation) {
    return NextResponse.json({ messages: [] });
  }

  const { data, error } = await admin
    .from("support_messages")
    .select("id, conversation_id, sender_type, message, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: data || [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawMessage = String(body.message || "").trim();
    const conversationId = body.conversationId ? String(body.conversationId) : null;
    const visitorToken = body.visitorToken ? String(body.visitorToken) : crypto.randomUUID();
    const guestName = String(body.name || "").trim();
    const guestEmail = String(body.email || "").trim().toLowerCase();

    if (!rawMessage) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const admin = createAdminClient();

    let profile: { full_name?: string | null; email?: string | null } | null = null;
    if (user?.id) {
      const { data } = await admin
        .from("profiles")
        .select("full_name,email")
        .eq("id", user.id)
        .maybeSingle();
      profile = data;
    }

    let activeConversationId = conversationId;
    let conversation = null as { id: string; visitor_token: string } | null;

    if (activeConversationId) {
      const { data } = await admin
        .from("support_conversations")
        .select("id, visitor_token")
        .eq("id", activeConversationId)
        .eq("visitor_token", visitorToken)
        .maybeSingle();
      conversation = data;
    }

    if (!conversation) {
      const { data, error } = await admin
        .from("support_conversations")
        .insert({
          user_id: user?.id || null,
          visitor_token: visitorToken,
          guest_name: profile?.full_name || guestName || "Website visitor",
          guest_email: profile?.email || guestEmail || user?.email || null,
          subject: "Nova AI support conversation",
          status: "OPEN",
          last_message_at: new Date().toISOString()
        })
        .select("id, visitor_token")
        .single();

      if (error) throw error;
      conversation = data;
      activeConversationId = data.id;
    }

    const { data: message, error: messageError } = await admin
      .from("support_messages")
      .insert({
        conversation_id: activeConversationId,
        sender_type: "USER",
        sender_id: user?.id || null,
        message: rawMessage
      })
      .select("id, conversation_id, sender_type, message, created_at")
      .single();

    if (messageError) throw messageError;

    await admin
      .from("support_conversations")
      .update({ status: "OPEN", last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", activeConversationId);

    await admin.from("activity_logs").insert({
      actor_id: user?.id || null,
      action: "support.message.created",
      metadata: { conversationId: activeConversationId }
    });

    sendAdminEmail(
      "New NovaVest support message",
      supportEmailHtml({
        name: profile?.full_name || guestName || "Website visitor",
        email: profile?.email || guestEmail || user?.email || "Not provided",
        message: rawMessage
      })
    ).catch((error) => console.error("Support admin email failed:", error));

    return NextResponse.json({
      conversationId: activeConversationId,
      visitorToken: conversation.visitor_token,
      message
    });
  } catch (error: any) {
    console.error("Support message error:", error);
    return NextResponse.json({ error: error.message || "Unable to send support message." }, { status: 500 });
  }
}
