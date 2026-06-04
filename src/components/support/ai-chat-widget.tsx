"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CONVERSATION_KEY = "novavest-support-conversation-id";
const VISITOR_TOKEN_KEY = "novavest-support-visitor-token";

type SupportMessage = {
  id?: string;
  conversation_id?: string;
  sender_type?: "USER" | "ADMIN" | "SYSTEM";
  role?: "assistant" | "user";
  message?: string;
  text?: string;
  created_at?: string;
};

function getOrCreateVisitorToken() {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(VISITOR_TOKEN_KEY);
  if (existing) return existing;
  const next = crypto.randomUUID();
  window.localStorage.setItem(VISITOR_TOKEN_KEY, next);
  return next;
}

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorToken, setVisitorToken] = useState<string>("");
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hello, I am Nova AI Support. Send your message here and an admin can reply directly from the NovaVest admin dashboard."
    }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function loadMessages(activeConversationId = conversationId, activeVisitorToken = visitorToken) {
    if (!activeConversationId || !activeVisitorToken) return;
    setLoadingMessages(true);
    try {
      const response = await fetch(`/api/support/messages?conversationId=${activeConversationId}&visitorToken=${activeVisitorToken}`, {
        cache: "no-store"
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load messages.");
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          text: "Hello, I am Nova AI Support. Send your message here and an admin can reply directly from the NovaVest admin dashboard."
        },
        ...(payload.messages || [])
      ]);
    } catch (error: any) {
      toast.error(error.message || "Unable to load support messages.");
    } finally {
      setLoadingMessages(false);
    }
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const value = String(formData.get("message") || "").trim();
    if (!value) return;

    const activeVisitorToken = visitorToken || getOrCreateVisitorToken();
    if (!visitorToken) setVisitorToken(activeVisitorToken);

    const optimisticMessage: SupportMessage = {
      id: `local-${Date.now()}`,
      sender_type: "USER",
      message: value,
      created_at: new Date().toISOString()
    };

    setMessages((items) => [...items, optimisticMessage]);
    setSending(true);

    try {
      const response = await fetch("/api/support/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: value,
          conversationId,
          visitorToken: activeVisitorToken
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to send message.");

      if (payload.conversationId) {
        setConversationId(payload.conversationId);
        window.localStorage.setItem(CONVERSATION_KEY, payload.conversationId);
      }

      if (payload.visitorToken) {
        setVisitorToken(payload.visitorToken);
        window.localStorage.setItem(VISITOR_TOKEN_KEY, payload.visitorToken);
      }

      form.reset();
      setMessages((items) => [
        ...items.filter((item) => item.id !== optimisticMessage.id),
        payload.message,
        {
          id: `system-${Date.now()}`,
          role: "assistant",
          text: "Message received. An admin can now reply from the admin dashboard. Keep this chat open or come back later to see the reply."
        }
      ]);
    } catch (error: any) {
      setMessages((items) => items.filter((item) => item.id !== optimisticMessage.id));
      toast.error(error.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    const storedConversation = window.localStorage.getItem(CONVERSATION_KEY);
    const token = getOrCreateVisitorToken();
    setVisitorToken(token);
    if (storedConversation) {
      setConversationId(storedConversation);
      loadMessages(storedConversation, token);
    }
  }, []);

  useEffect(() => {
    if (!open || !conversationId || !visitorToken) return;
    const timer = setInterval(() => loadMessages(conversationId, visitorToken), 8000);
    return () => clearInterval(timer);
  }, [open, conversationId, visitorToken]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open]);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-4 w-[min(92vw,400px)] rounded-[1.5rem] border border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-teal-300 p-2 text-slate-950"><Bot className="h-5 w-5" /></div>
              <div>
                <p className="font-bold">Nova AI Support</p>
                <p className="flex items-center gap-1 text-xs text-slate-500"><ShieldCheck className="h-3 w-3" /> Connected to admin desk</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close support chat"><X className="h-5 w-5" /></button>
          </div>

          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {loadingMessages && <div className="flex items-center gap-2 text-xs text-slate-500"><Loader2 className="h-3 w-3 animate-spin" /> Syncing messages...</div>}
            {messages.map((m, i) => {
              const isUser = m.sender_type === "USER" || m.role === "user";
              const isAdmin = m.sender_type === "ADMIN";
              const text = m.message || m.text || "";
              return (
                <div key={m.id || i} className={`rounded-2xl p-3 text-sm ${isUser ? "ml-8 bg-teal-300 text-slate-950" : isAdmin ? "mr-8 bg-violet-300 text-slate-950" : "bg-white/10 text-slate-200"}`}>
                  {isAdmin && <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] opacity-70">Admin reply</p>}
                  {text}
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={send} className="mt-4 flex gap-2">
            <Input name="message" placeholder="Type your message..." disabled={sending} />
            <Button size="icon" loading={sending} aria-label="Send message"><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      )}
      <Button onClick={() => setOpen(!open)} variant="premium" className="rounded-full px-5 shadow-[0_0_40px_rgba(45,212,191,.35)]"><Bot className="h-5 w-5" /> Support</Button>
    </div>
  );
}
