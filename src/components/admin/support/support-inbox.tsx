"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Inbox, Loader2, MessageCircle, RefreshCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Conversation = {
  id: string;
  guest_name: string | null;
  guest_email: string | null;
  subject: string | null;
  status: string;
  last_message_at: string | null;
  created_at: string;
};

type SupportMessage = {
  id: string;
  conversation_id: string;
  sender_type: "USER" | "ADMIN" | "SYSTEM";
  message: string;
  created_at: string;
};

export function SupportInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replying, setReplying] = useState(false);

  const selected = useMemo(() => conversations.find((item) => item.id === selectedId), [conversations, selectedId]);

  async function loadConversations() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/support/conversations", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load conversations.");
      setConversations(payload.conversations || []);
      if (!selectedId && payload.conversations?.[0]?.id) setSelectedId(payload.conversations[0].id);
    } catch (error: any) {
      toast.error(error.message || "Unable to load support inbox.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(conversationId: string) {
    setLoadingMessages(true);
    try {
      const response = await fetch(`/api/admin/support/conversations/${conversationId}/messages`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load messages.");
      setMessages(payload.messages || []);
    } catch (error: any) {
      toast.error(error.message || "Unable to load messages.");
    } finally {
      setLoadingMessages(false);
    }
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const message = String(formData.get("message") || "").trim();
    if (!message) return;

    setReplying(true);
    try {
      const response = await fetch(`/api/admin/support/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to send reply.");
      form.reset();
      setMessages((items) => [...items, payload.message]);
      setConversations((items) =>
        items.map((item) => item.id === selectedId ? { ...item, status: "PENDING_USER", last_message_at: new Date().toISOString() } : item)
      );
      toast.success("Reply sent to user.");
    } catch (error: any) {
      toast.error(error.message || "Unable to send reply.");
    } finally {
      setReplying(false);
    }
  }

  useEffect(() => {
    loadConversations();
    const timer = setInterval(loadConversations, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    loadMessages(selectedId);
  }, [selectedId]);

  return (
    <div className="grid gap-6 xl:grid-cols-[24rem_1fr]">
      <Card className="glass-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <p className="flex items-center gap-2 text-lg font-bold"><Inbox className="h-5 w-5 text-teal-200" /> Support Inbox</p>
            <p className="text-xs text-slate-500">Messages from Nova AI support widget.</p>
          </div>
          <Button variant="outline" size="icon" onClick={loadConversations} loading={loading} aria-label="Refresh inbox">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="max-h-[68vh] overflow-y-auto p-3">
          {loading ? (
            <div className="grid place-items-center py-12 text-slate-500"><Loader2 className="mb-3 h-6 w-6 animate-spin" /> Loading conversations...</div>
          ) : conversations.length ? conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedId(conversation.id)}
              className={cn(
                "mb-2 w-full rounded-2xl border border-white/10 p-4 text-left transition hover:bg-white/10",
                selectedId === conversation.id && "border-teal-300/40 bg-teal-300/10"
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="truncate font-semibold">{conversation.guest_name || "Website visitor"}</p>
                <Badge variant={conversation.status === "OPEN" ? "default" : "violet"}>{conversation.status}</Badge>
              </div>
              <p className="truncate text-xs text-slate-400">{conversation.guest_email || "No email provided"}</p>
              <p className="mt-2 text-xs text-slate-500">
                {conversation.last_message_at ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true }) : "No activity yet"}
              </p>
            </button>
          )) : (
            <div className="grid place-items-center rounded-3xl border border-dashed border-white/10 py-12 text-center text-slate-500">
              <MessageCircle className="mb-3 h-8 w-8" />
              <p>No support messages yet.</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="glass-card flex min-h-[70vh] flex-col overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <p className="text-lg font-bold">{selected ? selected.guest_name || "Website visitor" : "Select a conversation"}</p>
          <p className="text-xs text-slate-500">{selected?.guest_email || "Conversation messages will appear here."}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loadingMessages ? (
            <div className="grid h-full place-items-center text-slate-500"><Loader2 className="mb-3 h-6 w-6 animate-spin" /> Loading messages...</div>
          ) : selectedId ? (
            <div className="space-y-3">
              {messages.map((item) => (
                <div key={item.id} className={cn("max-w-[82%] rounded-3xl p-4 text-sm", item.sender_type === "ADMIN" ? "ml-auto bg-teal-300 text-slate-950" : "bg-white/10 text-slate-200")}>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[.18em] opacity-70">{item.sender_type === "ADMIN" ? "Admin" : "User"}</p>
                  <p className="whitespace-pre-wrap">{item.message}</p>
                  <p className="mt-2 text-[11px] opacity-60">{new Date(item.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid h-full place-items-center text-center text-slate-500">
              <div><MessageCircle className="mx-auto mb-3 h-10 w-10" /><p>Select a conversation to reply.</p></div>
            </div>
          )}
        </div>

        <form onSubmit={sendReply} className="border-t border-white/10 p-5">
          <Textarea name="message" placeholder="Type your reply to the user..." disabled={!selectedId || replying} />
          <div className="mt-3 flex justify-end">
            <Button type="submit" loading={replying} loadingText="Sending reply..." disabled={!selectedId}>
              <Send className="h-4 w-4" /> Send Reply
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
