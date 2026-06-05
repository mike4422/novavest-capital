"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Network, Save, Users, Gift, ShieldAlert, Plus, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ReferralSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // General Settings
  const [enabled, setEnabled] = useState("true");
  const [requireDeposit, setRequireDeposit] = useState("false");
  const [signupBonus, setSignupBonus] = useState("0");

  // Multi-Level Structure (Array of percentages)
  const [levels, setLevels] = useState<number[]>([5, 2, 1]);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/referral-settings");
      const json = await res.json();
      
      if (json.ok && json.settings) {
        setEnabled(json.settings.enabled ? "true" : "false");
        setRequireDeposit(json.settings.requireActiveDeposit ? "true" : "false");
        setSignupBonus(String(json.settings.signupBonus || 0));
        setLevels(json.settings.levels || [5, 2, 1]);
      }
    } catch (err) {
      toast.error("Failed to load referral settings.");
    } finally {
      setFetching(false);
    }
  }

  function handleLevelChange(index: number, value: string) {
    const newLevels = [...levels];
    newLevels[index] = Number(value);
    setLevels(newLevels);
  }

  function addLevel() {
    if (levels.length >= 10) return toast.error("Maximum of 10 referral levels allowed.");
    setLevels([...levels, 0.5]);
  }

  function removeLevel(index: number) {
    if (levels.length === 1) return toast.error("You must have at least 1 referral level.");
    const newLevels = levels.filter((_, i) => i !== index);
    setLevels(newLevels);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      enabled: enabled === "true",
      requireActiveDeposit: requireDeposit === "true",
      signupBonus: Number(signupBonus),
      levels: levels
    };

    try {
      const res = await fetch("/api/admin/referral-settings", {
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
    return <div className="p-12 text-center text-slate-500">Loading referral settings...</div>;
  }

  return (
    <>
      <AdminHeader 
        title="Referral & Affiliate Settings" 
        subtitle="Configure your multi-level marketing tiers, bonuses, and commission rules." 
      />
      
      <form onSubmit={handleSave} className="p-4 md:p-8 space-y-8 max-w-5xl">
        
        {/* Top Bar with Save Button */}
        <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-white/10">
          <p className="text-sm text-slate-400">Manage how affiliates are rewarded for bringing in new investors.</p>
          <Button type="submit" variant="premium" loading={loading}>
            <Save className="h-4 w-4 mr-2" /> Save Commission Rules
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* General Rules Box */}
          <Card className="glass-card p-6 border-violet-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-violet-400">
                <ShieldAlert className="h-5 w-5" /> Affiliate Rules
              </h2>
              <Badge variant={enabled === "true" ? "success" : "secondary"}>
                {enabled === "true" ? "ACTIVE" : "DISABLED"}
              </Badge>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Affiliate Program Status</Label>
                <Select value={enabled} onValueChange={setEnabled}>
                  <SelectTrigger className={enabled === "true" ? "border-emerald-500/50 text-emerald-300 bg-emerald-500/10" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Enabled (Users earn commissions)</SelectItem>
                    <SelectItem value="false">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Commission Eligibility</Label>
                <Select value={requireDeposit} onValueChange={setRequireDeposit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Open (Anyone can earn commissions)</SelectItem>
                    <SelectItem value="true">Strict (Must have an active deposit to earn)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-slate-500">
                  If "Strict" is chosen, "free" users cannot withdraw referral commissions until they invest themselves.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <Label className="flex items-center gap-2 text-amber-400">
                  <Gift className="h-4 w-4" /> Registration Bonus (USD)
                </Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={signupBonus} 
                  onChange={(e) => setSignupBonus(e.target.value)} 
                />
                <p className="text-[10px] text-slate-500">
                  Automatic bonus credited to every new user immediately upon registration. Set to 0 to disable.
                </p>
              </div>
            </div>
          </Card>

          {/* Multi-Level Tiers Box */}
          <Card className="glass-card p-6 border-sky-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-sky-400">
                <Network className="h-5 w-5" /> Multi-Level Tiers
              </h2>
              <Badge variant="secondary" className="bg-sky-500/10 text-sky-300 border-sky-500/20">
                {levels.length} Levels
              </Badge>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs text-slate-400 mb-4">
                Define the percentage of the deposit amount that gets credited to the upline. Level 1 is the direct inviter.
              </p>

              {levels.map((percent, index) => (
                <div key={index} className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-white/5 border border-white/10 h-10 px-3 rounded-md flex items-center justify-center text-sm font-bold text-slate-300 w-24 shrink-0">
                    Level {index + 1}
                  </div>
                  <div className="relative flex-1">
                    <Input 
                      type="number" 
                      step="0.1" 
                      min="0"
                      value={percent} 
                      onChange={(e) => handleLevelChange(index, e.target.value)} 
                      className="pr-8 font-mono text-emerald-400"
                    />
                    <span className="absolute right-3 top-2.5 text-slate-500 text-sm">%</span>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeLevel(index)}
                    className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button 
                type="button" 
                variant="outline" 
                className="w-full mt-4 border-dashed border-white/20 text-slate-400 hover:text-white"
                onClick={addLevel}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Deeper Level
              </Button>
            </div>
          </Card>

        </div>
      </form>
    </>
  );
}