"use client";

import { FormEvent, useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello, I am Nova AI. I can help with deposits, plans, withdrawals, KYC, and account security." }
  ]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const value = String(formData.get("message") || "").trim();
    if (!value) return;

    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    setMessages((items) => [
      ...items,
      { role: "user", text: value },
      { role: "assistant", text: "Thanks. A support specialist can connect this widget to your live AI/support API. For now, please check your dashboard notifications or contact support." }
    ]);
    form.reset();
    setSending(false);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-4 w-[min(92vw,380px)] rounded-[1.5rem] border border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="rounded-2xl bg-teal-300 p-2 text-slate-950"><Bot className="h-5 w-5" /></div><div><p className="font-bold">Nova AI Support</p><p className="text-xs text-slate-500">Online assistant</p></div></div>
            <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
          </div>
          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {messages.map((m, i) => <div key={i} className={`rounded-2xl p-3 text-sm ${m.role === "assistant" ? "bg-white/10 text-slate-200" : "ml-8 bg-teal-300 text-slate-950"}`}>{m.text}</div>)}
          </div>
          <form onSubmit={send} className="mt-4 flex gap-2"><Input name="message" placeholder="Ask about your account..." disabled={sending} /><Button size="icon" loading={sending} aria-label="Send message"><Send className="h-4 w-4" /></Button></form>
        </div>
      )}
      <Button onClick={() => setOpen(!open)} variant="premium" className="rounded-full px-5 shadow-[0_0_40px_rgba(45,212,191,.35)]"><Bot className="h-5 w-5" /> Support</Button>
    </div>
  );
}
