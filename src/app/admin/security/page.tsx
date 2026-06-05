"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ShieldCheck, Save, Lock, Fingerprint, Globe, Clock, AlertTriangle } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function SecuritySettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // User Security State
  const [emailVerification, setEmailVerification] = useState("true");
  const [withdrawal2FA, setWithdrawal2FA] = useState("false");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");

  // Admin Security State
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [ipWhitelist, setIpWhitelist] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/security");
      const json = await res.json();
      
      if (json.ok && json.settings) {
        setEmailVerification(json.settings.requireEmailVerification ? "true" : "false");
        setWithdrawal2FA(json.settings.requireWithdrawal2FA ? "true" : "false");
        setMaxLoginAttempts(String(json.settings.maxLoginAttempts || 5));
        setSessionTimeout(String(json.settings.sessionTimeoutMinutes || 60));
        setIpWhitelist(json.settings.adminIpWhitelist || "");
      }
    } catch (err) {
      toast.error("Failed to load security settings.");
    } finally {
      setFetching(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    
    if (ipWhitelist.trim() !== "" && !confirm("WARNING: You have entered an IP Whitelist. If your current IP address changes, you will be permanently locked out of this admin panel. Are you sure you want to proceed?")) {
      return;
    }

    setLoading(true);

    const payload = {
      requireEmailVerification: emailVerification === "true",
      requireWithdrawal2FA: withdrawal2FA === "true",
      maxLoginAttempts: Number(maxLoginAttempts),
      sessionTimeoutMinutes: Number(sessionTimeout),
      adminIpWhitelist: ipWhitelist.trim()
    };

    try {
      const res = await fetch("/api/admin/security", {
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
    return <div className="p-12 text-center text-slate-500">Loading security policies...</div>;
  }

  return (
    <>
      <AdminHeader 
        title="Global Security" 
        subtitle="Enforce user authentication rules and protect the administrative dashboard." 
      />
      
      <form onSubmit={handleSave} className="p-4 md:p-8 space-y-8 max-w-5xl">
        
        {/* Top Bar with Save Button */}
        <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-white/10">
          <p className="text-sm text-slate-400">Security configurations take effect immediately upon saving.</p>
          <Button type="submit" variant="premium" loading={loading}>
            <Save className="h-4 w-4 mr-2" /> Save Policies
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* User Policies Box */}
          <Card className="glass-card p-6 border-sky-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-sky-400">
                <Fingerprint className="h-5 w-5" /> User Security Policies
              </h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Email Verification Requirement</Label>
                <Select value={emailVerification} onValueChange={setEmailVerification}>
                  <SelectTrigger className={emailVerification === "true" ? "border-emerald-500/50 text-emerald-300 bg-emerald-500/10" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Strict (Must verify email to deposit/withdraw)</SelectItem>
                    <SelectItem value="false">Relaxed (No verification required)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Withdrawal 2FA Enforcement</Label>
                <Select value={withdrawal2FA} onValueChange={setWithdrawal2FA}>
                  <SelectTrigger className={withdrawal2FA === "true" ? "border-emerald-500/50 text-emerald-300 bg-emerald-500/10" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Strict (Requires 2FA / OTP code)</SelectItem>
                    <SelectItem value="false">Relaxed (Standard password only)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-slate-500">
                  When strict, users must input a one-time passcode sent to their email to authorize a payout.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <Label className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-slate-400" /> Max Failed Login Attempts
                </Label>
                <Input 
                  type="number" 
                  min="1"
                  step="1"
                  value={maxLoginAttempts} 
                  onChange={(e) => setMaxLoginAttempts(e.target.value)} 
                />
                <p className="text-[10px] text-slate-500">
                  Number of failed password attempts before a user's IP is temporarily blocked to prevent brute-force attacks.
                </p>
              </div>
            </div>
          </Card>

          {/* Admin Protection Box */}
          <Card className="glass-card p-6 border-rose-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-rose-400">
                <ShieldCheck className="h-5 w-5" /> Admin Protection
              </h2>
              <Badge variant="warning" className="bg-rose-500/10 text-rose-300 border-rose-500/20">
                Critical
              </Badge>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-rose-400">
                  <Globe className="h-4 w-4" /> Allowed IPs Whitelist
                </Label>
                <Input 
                  value={ipWhitelist} 
                  onChange={(e) => setIpWhitelist(e.target.value)} 
                  placeholder="e.g. 192.168.1.1, 10.0.0.1"
                />
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex gap-3 text-rose-200 text-xs">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>Leave completely blank to allow admin access from anywhere. If you enter IPs (comma separated), you will be blocked if you try to log in from a different network (like your mobile data).</p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" /> Admin Session Timeout (Minutes)
                </Label>
                <Input 
                  type="number" 
                  min="5"
                  step="5"
                  value={sessionTimeout} 
                  onChange={(e) => setSessionTimeout(e.target.value)} 
                />
                <p className="text-[10px] text-slate-500">
                  Automatically log out administrators after this many minutes of inactivity to prevent session hijacking.
                </p>
              </div>
            </div>
          </Card>

        </div>
      </form>
    </>
  );
}