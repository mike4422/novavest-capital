"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Settings, Sliders, Shield, Save } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Platform Settings State
  const [platformName, setPlatformName] = useState("NovaVest Capital");
  const [maintenanceMode, setMaintenanceMode] = useState("false");
  const [referralPercent, setReferralPercent] = useState("5");

  // Financial Limits State
  const [minWithdrawal, setMinWithdrawal] = useState("50");
  const [dailyLimit, setDailyLimit] = useState("100000");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      
      if (json.ok && json.settings) {
        // Map database JSON into our React state
        const platform = json.settings.find((s: any) => s.key === "platform")?.value;
        const limits = json.settings.find((s: any) => s.key === "limits")?.value;

        if (platform) {
          setPlatformName(platform.name || "NovaVest Capital");
          setMaintenanceMode(platform.maintenance ? "true" : "false");
          setReferralPercent(String(platform.referralCommissionPercent || 5));
        }

        if (limits) {
          setMinWithdrawal(String(limits.minimumWithdrawal || 50));
          setDailyLimit(String(limits.dailyWithdrawalLimit || 100000));
        }
      }
    } catch (err) {
      toast.error("Failed to load current settings.");
    } finally {
      setFetching(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Package the state back into the exact JSON format the database expects
    const updates = [
      {
        key: "platform",
        value: {
          name: platformName,
          maintenance: maintenanceMode === "true",
          referralCommissionPercent: Number(referralPercent)
        }
      },
      {
        key: "limits",
        value: {
          minimumWithdrawal: Number(minWithdrawal),
          dailyWithdrawalLimit: Number(dailyLimit)
        }
      }
    ];

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
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
    return (
      <div className="p-12 text-center text-slate-500">Loading system configurations...</div>
    );
  }

  return (
    <>
      <AdminHeader 
        title="System Settings" 
        subtitle="Manage global platform configurations, maintenance modes, and financial limits." 
      />
      
      <form onSubmit={handleSave} className="p-4 md:p-8 space-y-8 max-w-5xl">
        
        {/* Top Bar with Save Button */}
        <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-white/10">
          <p className="text-sm text-slate-400">Updates applied here will affect the platform globally in real-time.</p>
          <Button type="submit" variant="premium" loading={loading}>
            <Save className="h-4 w-4 mr-2" /> Save All Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Platform Settings Box */}
          <Card className="glass-card p-6 border-teal-500/20">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-teal-400">
              <Settings className="h-5 w-5" /> General Platform
            </h2>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Platform Name</Label>
                <Input 
                  value={platformName} 
                  onChange={(e) => setPlatformName(e.target.value)} 
                  required 
                />
                <p className="text-[10px] text-slate-500">This updates the name displayed in automated emails and receipts.</p>
              </div>

              <div className="space-y-2">
                <Label>Standard Referral Commission (%)</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  value={referralPercent} 
                  onChange={(e) => setReferralPercent(e.target.value)} 
                  required 
                />
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <Label className="flex items-center gap-2 text-rose-400">
                  <Shield className="h-4 w-4" /> Maintenance Mode
                </Label>
                <Select value={maintenanceMode} onValueChange={setMaintenanceMode}>
                  <SelectTrigger className={maintenanceMode === "true" ? "border-rose-500/50 text-rose-300 bg-rose-500/10" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Disabled (Platform is Live)</SelectItem>
                    <SelectItem value="true">Enabled (Users cannot log in)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-slate-500">Enable this to lock users out of the dashboard while performing upgrades.</p>
              </div>
            </div>
          </Card>

          {/* Financial Limits Box */}
          <Card className="glass-card p-6 border-violet-500/20">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-violet-400">
              <Sliders className="h-5 w-5" /> Financial Limits
            </h2>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Minimum Withdrawal Amount (USD)</Label>
                <Input 
                  type="number" 
                  value={minWithdrawal} 
                  onChange={(e) => setMinWithdrawal(e.target.value)} 
                  required 
                />
                <p className="text-[10px] text-slate-500">Users cannot request payouts lower than this threshold.</p>
              </div>

              <div className="space-y-2">
                <Label>Daily Withdrawal Limit (USD)</Label>
                <Input 
                  type="number" 
                  value={dailyLimit} 
                  onChange={(e) => setDailyLimit(e.target.value)} 
                  required 
                />
                <p className="text-[10px] text-slate-500">Maximum amount a single user can withdraw in a 24-hour period.</p>
              </div>
            </div>
          </Card>

        </div>
      </form>
    </>
  );
}