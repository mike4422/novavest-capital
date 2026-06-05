"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { HardHat, Save, Type, Clock, Mail, MonitorX, AlertTriangle } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export default function MaintenancePageSettings() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Content State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [estimatedCompletion, setEstimatedCompletion] = useState("");
  const [showSupportEmail, setShowSupportEmail] = useState("true");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/maintenance-page");
      const json = await res.json();
      
      if (json.ok && json.settings) {
        setTitle(json.settings.title || "");
        setMessage(json.settings.message || "");
        setEstimatedCompletion(json.settings.estimatedCompletion || "");
        setShowSupportEmail(json.settings.showSupportEmail ? "true" : "false");
      }
    } catch (err) {
      toast.error("Failed to load maintenance settings.");
    } finally {
      setFetching(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title,
      message,
      estimatedCompletion,
      showSupportEmail: showSupportEmail === "true"
    };

    try {
      const res = await fetch("/api/admin/maintenance-page", {
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
    return <div className="p-12 text-center text-slate-500">Loading offline screen configuration...</div>;
  }

  return (
    <>
      <AdminHeader 
        title="Maintenance Page Design" 
        subtitle="Customize the public-facing screen that users see when the platform is taken offline." 
      />
      
      <form onSubmit={handleSave} className="p-4 md:p-8 space-y-8 max-w-5xl">
        
        {/* Top Bar with Save Button */}
        <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <MonitorX className="h-5 w-5 text-slate-400" />
            <p className="text-sm text-slate-400">
              Note: To actually take the site offline, toggle the switch in <Link href="/admin/settings" className="text-teal-400 hover:underline">System Settings</Link>.
            </p>
          </div>
          <Button type="submit" variant="premium" loading={loading}>
            <Save className="h-4 w-4 mr-2" /> Save Content
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          
          {/* Main Content Editor */}
          <Card className="glass-card p-6 border-amber-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-amber-400">
                <HardHat className="h-5 w-5" /> Screen Content
              </h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-slate-400" /> Headline Title
                </Label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. System Upgrades in Progress"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MonitorX className="h-4 w-4 text-slate-400" /> Maintenance Message
                </Label>
                <Textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  className="min-h-[160px] bg-slate-950/50 resize-y"
                  placeholder="Explain why the platform is offline and reassure your users..."
                  required
                />
              </div>
            </div>
          </Card>

          {/* Additional Details Box */}
          <Card className="glass-card p-6 border-slate-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-300">
                <Clock className="h-5 w-5" /> Extra Details
              </h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-sky-400" /> Estimated Time of Return
                </Label>
                <Input 
                  value={estimatedCompletion} 
                  onChange={(e) => setEstimatedCompletion(e.target.value)} 
                  placeholder="e.g. Approximately 2 Hours"
                />
                <p className="text-[10px] text-slate-500">
                  Optional. Leave blank to hide this from the offline page.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-rose-400" /> Show Support Email
                </Label>
                <Select value={showSupportEmail} onValueChange={setShowSupportEmail}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Visible (Display contact email)</SelectItem>
                    <SelectItem value="false">Hidden</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-slate-500">
                  Allows users to contact support while the site is down.
                </p>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 text-amber-200 text-xs">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <p>When maintenance mode is active, all public pages will redirect to this screen. Only logged-in administrators will be able to access the platform.</p>
              </div>
            </div>
          </Card>

        </div>
      </form>
    </>
  );
}