"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Zap, Save, ShieldAlert, AlertTriangle } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function AutoWithdrawalsSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Settings State
  const [enabled, setEnabled] = useState("false");
  const [maxAutoAmount, setMaxAutoAmount] = useState("50");
  const [maxDailyRequests, setMaxDailyRequests] = useState("2");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/auto-withdrawals-settings");
      const json = await res.json();
      
      if (json.ok && json.settings) {
        setEnabled(json.settings.enabled ? "true" : "false");
        setMaxAutoAmount(String(json.settings.maxAutoAmount || 50));
        setMaxDailyRequests(String(json.settings.maxDailyRequests || 2));
      }
    } catch (err) {
      toast.error("Failed to load auto-withdrawal settings.");
    } finally {
      setFetching(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    
    if (enabled === "true" && !confirm("WARNING: Enabling auto-withdrawals allows the system to process payouts instantly using your API keys without manual review. Ensure your hot wallet limits are secure. Continue?")) {
      return;
    }

    setLoading(true);

    const payload = {
      enabled: enabled === "true",
      maxAutoAmount: Number(maxAutoAmount),
      maxDailyRequests: Number(maxDailyRequests)
    };

    try {
      const res = await fetch("/api/admin/auto-withdrawals-settings", {
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
    return <div className="p-12 text-center text-slate-500">Loading auto-withdrawal settings...</div>;
  }

  return (
    <>
      <AdminHeader 
        title="Auto-Withdrawals Settings" 
        subtitle="Configure limits for instant payouts and automatic transaction processing." 
      />
      
      <form onSubmit={handleSave} className="p-4 md:p-8 space-y-8 max-w-5xl">
        
        {/* Top Bar with Save Button */}
        <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-white/10">
          <p className="text-sm text-slate-400">Control how the system handles user withdrawal requests.</p>
          <Button type="submit" variant="premium" loading={loading}>
            <Save className="h-4 w-4 mr-2" /> Save Limits
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Main Status Box */}
          <Card className="glass-card p-6 border-amber-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-amber-400">
                <Zap className="h-5 w-5" /> Automation Status
              </h2>
              <Badge variant={enabled === "true" ? "success" : "secondary"}>
                {enabled === "true" ? "ACTIVE" : "DISABLED"}
              </Badge>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>System Behavior</Label>
                <Select value={enabled} onValueChange={setEnabled}>
                  <SelectTrigger className={enabled === "true" ? "border-amber-500/50 text-amber-300 bg-amber-500/10" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Manual (All requests go to Pending review)</SelectItem>
                    <SelectItem value="true">Automated (Process instantly via API)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {enabled === "true" && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex gap-3 text-rose-200 text-sm">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <p>Auto-withdrawals require an active, configured payment gateway (like CoinPayments or NOWPayments) in your Processings tab to execute the transaction.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Safety Limits Box */}
          <Card className={`glass-card p-6 transition-opacity ${enabled === "false" ? "opacity-50 pointer-events-none" : "border-emerald-500/20"}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-emerald-400">
                <ShieldAlert className="h-5 w-5" /> Safety Thresholds
              </h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Maximum Auto-Withdrawal Amount (USD)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={maxAutoAmount} 
                  onChange={(e) => setMaxAutoAmount(e.target.value)} 
                />
                <p className="text-[10px] text-slate-500">
                  Any withdrawal request strictly greater than this amount will bypass automation and be sent to Pending status for manual admin approval.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <Label>Maximum Daily Auto-Requests (Per User)</Label>
                <Input 
                  type="number" 
                  min="1"
                  step="1"
                  value={maxDailyRequests} 
                  onChange={(e) => setMaxDailyRequests(e.target.value)} 
                />
                <p className="text-[10px] text-slate-500">
                  The number of times a single user can utilize instant payouts in a 24-hour window. Subsequent requests require manual review to prevent draining.
                </p>
              </div>
            </div>
          </Card>

        </div>
      </form>
    </>
  );
}