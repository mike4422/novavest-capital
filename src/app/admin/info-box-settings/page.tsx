"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MessageSquare, Save, Megaphone, AlertCircle } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function InfoBoxSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Info Box State
  const [enabled, setEnabled] = useState("false");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/info-box-settings");
      const json = await res.json();
      
      if (json.ok && json.settings) {
        setEnabled(json.settings.enabled ? "true" : "false");
        setTitle(json.settings.title || "");
        setMessage(json.settings.message || "");
        setType(json.settings.type || "info");
      }
    } catch (err) {
      toast.error("Failed to load info box settings.");
    } finally {
      setFetching(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      enabled: enabled === "true",
      title,
      message,
      type
    };

    try {
      const res = await fetch("/api/admin/info-box-settings", {
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
    return <div className="p-12 text-center text-slate-500">Loading info box settings...</div>;
  }

  return (
    <>
      <AdminHeader 
        title="Info Box Settings" 
        subtitle="Manage global alerts, banners, and announcements displayed on the user dashboard." 
      />
      
      <form onSubmit={handleSave} className="p-4 md:p-8 space-y-8 max-w-5xl">
        
        {/* Top Bar with Save Button */}
        <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-white/10">
          <p className="text-sm text-slate-400">Instantly push important messages to all active users.</p>
          <Button type="submit" variant="premium" loading={loading}>
            <Save className="h-4 w-4 mr-2" /> Save Alert Box
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Configuration Card */}
          <Card className="glass-card p-6 border-sky-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-sky-400">
                <Megaphone className="h-5 w-5" /> Banner Configuration
              </h2>
              <Badge variant={enabled === "true" ? "success" : "secondary"}>
                {enabled === "true" ? "ACTIVE" : "HIDDEN"}
              </Badge>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Visibility Status</Label>
                <Select value={enabled} onValueChange={setEnabled}>
                  <SelectTrigger className={enabled === "true" ? "border-emerald-500/50 text-emerald-300 bg-emerald-500/10" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Visible (Show on User Dashboard)</SelectItem>
                    <SelectItem value="false">Hidden (Draft/Inactive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <Label>Alert Theme / Severity</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info (Blue - General Updates)</SelectItem>
                    <SelectItem value="success">Success (Green - Promos/Good News)</SelectItem>
                    <SelectItem value="warning">Warning (Yellow - Maintenance/Delays)</SelectItem>
                    <SelectItem value="promo">Promo (Purple - Special Offers)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Content Editor Card */}
          <Card className={`glass-card p-6 transition-opacity ${enabled === "false" ? "opacity-75" : "border-violet-500/20"}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-violet-400">
                <MessageSquare className="h-5 w-5" /> Message Content
              </h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Alert Title</Label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Scheduled Maintenance"
                  required={enabled === "true"}
                />
              </div>

              <div className="space-y-2">
                <Label>Alert Body</Label>
                <Textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  className="min-h-[120px] bg-slate-950/50 resize-y"
                  placeholder="Type your message here..."
                  required={enabled === "true"}
                />
              </div>

              {enabled === "true" && (
                <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-lg flex gap-3 text-sky-200 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>This message will be permanently pinned to the top of the user dashboard until you disable the Visibility Status.</p>
                </div>
              )}
            </div>
          </Card>

        </div>
      </form>
    </>
  );
}