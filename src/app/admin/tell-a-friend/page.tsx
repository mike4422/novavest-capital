"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Users, Save, Mail, Type, AlignLeft, Info } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function TellAFriendPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Template State
  const [enabled, setEnabled] = useState("true");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/tell-a-friend");
      const json = await res.json();
      
      if (json.ok && json.settings) {
        setEnabled(json.settings.enabled ? "true" : "false");
        setSubject(json.settings.subject || "");
        setMessage(json.settings.message || "");
      }
    } catch (err) {
      toast.error("Failed to load invitation template.");
    } finally {
      setFetching(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      enabled: enabled === "true",
      subject,
      message
    };

    try {
      const res = await fetch("/api/admin/tell-a-friend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return <div className="p-12 text-center text-slate-500">Loading template configuration...</div>;
  }

  return (
    <>
      <AdminHeader 
        title="Tell A Friend" 
        subtitle="Design the default email invitation template that users can send to their contacts." 
      />
      
      <form onSubmit={handleSave} className="p-4 md:p-8 space-y-8 max-w-5xl">
        
        {/* Top Bar with Save Button */}
        <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-white/10">
          <p className="text-sm text-slate-400">Optimize your platform's viral growth with a strong default message.</p>
          <Button type="submit" variant="premium" loading={loading}>
            <Save className="h-4 w-4 mr-2" /> Save Template
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          
          {/* Main Editor Box */}
          <Card className="glass-card p-6 border-sky-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-sky-400">
                <Mail className="h-5 w-5" /> Email Content
              </h2>
              <Badge variant={enabled === "true" ? "success" : "secondary"}>
                {enabled === "true" ? "ACTIVE" : "DISABLED"}
              </Badge>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-slate-400" /> Default Subject Line
                </Label>
                <Input 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  placeholder="e.g. You're invited to join NovaVest Capital!"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AlignLeft className="h-4 w-4 text-slate-400" /> Message Body
                </Label>
                <Textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  className="min-h-[250px] bg-slate-950/50 resize-y font-mono text-sm"
                  placeholder="Type the invitation email body here..."
                  required
                />
              </div>
            </div>
          </Card>

          {/* Configuration & Variables Box */}
          <div className="space-y-8">
            <Card className="glass-card p-6 border-violet-500/20">
              <h2 className="text-lg font-bold flex items-center gap-2 text-violet-400 mb-6">
                <Users className="h-5 w-5" /> Module Status
              </h2>
              <div className="space-y-2">
                <Label>Enable "Tell A Friend"</Label>
                <Select value={enabled} onValueChange={setEnabled}>
                  <SelectTrigger className={enabled === "true" ? "border-emerald-500/50 text-emerald-300 bg-emerald-500/10" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Enabled (Users can send invites)</SelectItem>
                    <SelectItem value="false">Disabled (Hide from dashboard)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-slate-500 mt-2">
                  If disabled, the "Invite Friends" form will be hidden from the user dashboard.
                </p>
              </div>
            </Card>

            <Card className="glass-card p-6 border-slate-500/20">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-300 mb-4">
                <Info className="h-5 w-5" /> Smart Variables
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Use these tags anywhere in the subject or message body. They will be automatically replaced with the correct data when the email is sent.
              </p>
              <div className="space-y-3">
                <div className="bg-slate-900 border border-white/10 p-2 rounded-lg">
                  <code className="text-sky-400 text-xs font-bold block mb-1">{`{USER_NAME}`}</code>
                  <span className="text-[10px] text-slate-500">The full name of the user sending the invite.</span>
                </div>
                <div className="bg-slate-900 border border-white/10 p-2 rounded-lg">
                  <code className="text-emerald-400 text-xs font-bold block mb-1">{`{REF_LINK}`}</code>
                  <span className="text-[10px] text-slate-500">The unique affiliate referral link of the sender.</span>
                </div>
                <div className="bg-slate-900 border border-white/10 p-2 rounded-lg">
                  <code className="text-violet-400 text-xs font-bold block mb-1">{`{SITE_NAME}`}</code>
                  <span className="text-[10px] text-slate-500">Your platform's name (e.g. NovaVest Capital).</span>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </form>
    </>
  );
}