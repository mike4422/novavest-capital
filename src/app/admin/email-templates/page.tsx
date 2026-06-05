"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Mail, Save, Code, Braces } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// The hardcoded list of events your system supports
const triggers = [
  { id: "WELCOME_EMAIL", label: "Welcome / Registration", vars: "{name}, {email}" },
  { id: "DEPOSIT_PENDING", label: "Deposit Request Pending", vars: "{name}, {amount}, {network}" },
  { id: "DEPOSIT_APPROVED", label: "Deposit Approved", vars: "{name}, {amount}" },
  { id: "WITHDRAWAL_REQUEST", label: "Withdrawal Request", vars: "{name}, {amount}, {wallet}" },
  { id: "WITHDRAWAL_APPROVED", label: "Withdrawal Approved", vars: "{name}, {amount}" },
  { id: "INVESTMENT_CREATED", label: "Investment Started", vars: "{name}, {plan}, {amount}, {profit}" },
  { id: "INVESTMENT_COMPLETED", label: "Investment Completed", vars: "{name}, {plan}, {return_amount}" },
];

export default function EmailTemplatesPage() {
  const [dbTemplates, setDbTemplates] = useState<any[]>([]);
  const [activeTrigger, setActiveTrigger] = useState(triggers[0]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form State
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");

  // Fetch templates on load
  useEffect(() => {
    fetchTemplates();
  }, []);

  // When templates load, or when active trigger changes, populate the form
  useEffect(() => {
    const existing = dbTemplates.find((t) => t.trigger_name === activeTrigger.id);
    if (existing) {
      setSubject(existing.subject);
      setBodyHtml(existing.body_html);
    } else {
      // Default placeholder if they haven't saved one yet
      setSubject(`Your NovaVest Capital Notification`);
      setBodyHtml(`<p>Hello ${activeTrigger.vars.includes('{name}') ? '{name}' : 'Investor'},</p>\n<p>This is a default message for ${activeTrigger.label}.</p>\n<p>Best regards,<br/>NovaVest Capital Team</p>`);
    }
  }, [activeTrigger, dbTemplates]);

  async function fetchTemplates() {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/email-templates");
      const json = await res.json();
      if (json.ok) setDbTemplates(json.templates || []);
    } catch (err) {
      toast.error("Failed to load templates.");
    } finally {
      setFetching(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trigger_name: activeTrigger.id,
          subject,
          body_html: bodyHtml,
          variables: activeTrigger.vars,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
      fetchTemplates(); // Refresh background data
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AdminHeader title="Email Templates" subtitle="Customize the automated HTML emails sent to your investors." />
      
      <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        
        {/* Left Sidebar: Triggers */}
        <Card className="glass-card flex flex-col h-fit">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h2 className="font-bold flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-teal-400" /> System Triggers</h2>
          </div>
          <div className="p-2 space-y-1">
            {triggers.map((trigger) => {
              const isSaved = dbTemplates.some(t => t.trigger_name === trigger.id);
              const isActive = activeTrigger.id === trigger.id;
              return (
                <button
                  key={trigger.id}
                  onClick={() => setActiveTrigger(trigger)}
                  disabled={fetching}
                  className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-all flex items-center justify-between ${
                    isActive 
                      ? "bg-teal-500/20 border border-teal-500/50 text-white" 
                      : "hover:bg-white/5 text-slate-400 border border-transparent"
                  }`}
                >
                  <span className="font-medium">{trigger.label}</span>
                  {isSaved && <span className="h-2 w-2 rounded-full bg-teal-400" title="Customized" />}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Right Area: Editor */}
        <Card className="glass-card">
          <form onSubmit={handleSave} className="flex flex-col h-full">
            <div className="p-6 border-b border-white/10 flex justify-between items-start bg-white/[0.02]">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Edit: {activeTrigger.label}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Braces className="h-3.5 w-3.5 text-violet-400" /> 
                  Available variables: <span className="font-mono text-violet-300">{activeTrigger.vars}</span>
                </div>
              </div>
              <Button type="submit" variant="premium" loading={loading} disabled={fetching}>
                <Save className="h-4 w-4 mr-2" /> Save Template
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Email Subject Line</Label>
                <Input 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  required 
                  placeholder="e.g. Welcome to NovaVest Capital!" 
                  className="font-semibold text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Code className="h-4 w-4 text-teal-400" /> HTML Body</Label>
                <Textarea 
                  value={bodyHtml} 
                  onChange={(e) => setBodyHtml(e.target.value)} 
                  required 
                  className="font-mono text-sm h-[400px] bg-slate-950/50 border-white/10 leading-relaxed resize-y"
                  placeholder="<p>Enter your HTML here...</p>"
                />
                <p className="text-[10px] text-slate-500 mt-2">
                  Use standard HTML tags. Avoid complex CSS grids or flexbox, as email clients prefer basic tables and inline styles. 
                  Place variables exactly as shown above (e.g. <span className="text-violet-400">{`{name}`}</span>).
                </p>
              </div>
            </div>
          </form>
        </Card>

      </div>
    </>
  );
}