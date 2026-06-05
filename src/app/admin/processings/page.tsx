"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CreditCard, Save, Bitcoin, Network, Wallet } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ProcessingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Gateway States
  const [manualEnabled, setManualEnabled] = useState("true");
  
  const [nowPaymentsEnabled, setNowPaymentsEnabled] = useState("false");
  const [nowPaymentsApiKey, setNowPaymentsApiKey] = useState("");
  const [nowPaymentsIpn, setNowPaymentsIpn] = useState("");

  const [coinPaymentsEnabled, setCoinPaymentsEnabled] = useState("false");
  const [coinPaymentsMerchantId, setCoinPaymentsMerchantId] = useState("");
  const [coinPaymentsIpn, setCoinPaymentsIpn] = useState("");

  useEffect(() => {
    fetchProcessings();
  }, []);

  async function fetchProcessings() {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/processings");
      const json = await res.json();
      
      if (json.ok && json.gateways) {
        const gw = json.gateways;
        
        if (gw.manual) setManualEnabled(gw.manual.enabled ? "true" : "false");
        
        if (gw.nowpayments) {
          setNowPaymentsEnabled(gw.nowpayments.enabled ? "true" : "false");
          setNowPaymentsApiKey(gw.nowpayments.apiKey || "");
          setNowPaymentsIpn(gw.nowpayments.ipnSecret || "");
        }

        if (gw.coinpayments) {
          setCoinPaymentsEnabled(gw.coinpayments.enabled ? "true" : "false");
          setCoinPaymentsMerchantId(gw.coinpayments.merchantId || "");
          setCoinPaymentsIpn(gw.coinpayments.ipnSecret || "");
        }
      }
    } catch (err) {
      toast.error("Failed to load processing settings.");
    } finally {
      setFetching(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      manual: { 
        enabled: manualEnabled === "true" 
      },
      nowpayments: { 
        enabled: nowPaymentsEnabled === "true", 
        apiKey: nowPaymentsApiKey, 
        ipnSecret: nowPaymentsIpn 
      },
      coinpayments: { 
        enabled: coinPaymentsEnabled === "true", 
        merchantId: coinPaymentsMerchantId, 
        ipnSecret: coinPaymentsIpn 
      }
    };

    try {
      const res = await fetch("/api/admin/processings", {
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
    return <div className="p-12 text-center text-slate-500">Loading payment gateways...</div>;
  }

  return (
    <>
      <AdminHeader 
        title="Payment Processings" 
        subtitle="Configure automated cryptocurrency gateways and manual deposit methods." 
      />
      
      <form onSubmit={handleSave} className="p-4 md:p-8 space-y-8 max-w-5xl">
        
        {/* Top Bar with Save Button */}
        <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-white/10">
          <p className="text-sm text-slate-400">Manage API keys and IPN secrets for automatic deposit verification.</p>
          <Button type="submit" variant="premium" loading={loading}>
            <Save className="h-4 w-4 mr-2" /> Save Configurations
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Manual Processing Box */}
          <Card className="glass-card p-6 border-slate-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-300">
                <Wallet className="h-5 w-5" /> Manual Crypto / Wire
              </h2>
              <Badge variant={manualEnabled === "true" ? "success" : "secondary"}>
                {manualEnabled === "true" ? "ACTIVE" : "DISABLED"}
              </Badge>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Gateway Status</Label>
                <Select value={manualEnabled} onValueChange={setManualEnabled}>
                  <SelectTrigger className={manualEnabled === "true" ? "border-emerald-500/50 text-emerald-300 bg-emerald-500/10" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Enabled (Users upload proof)</SelectItem>
                    <SelectItem value="false">Disabled</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-slate-500">
                  When enabled, users will send funds to the static addresses you configure in the "Wallet Addresses" page and upload a receipt.
                </p>
              </div>
            </div>
          </Card>

          {/* NowPayments Box */}
          <Card className="glass-card p-6 border-teal-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-teal-400">
                <Network className="h-5 w-5" /> NOWPayments API
              </h2>
              <Badge variant={nowPaymentsEnabled === "true" ? "success" : "secondary"}>
                {nowPaymentsEnabled === "true" ? "ACTIVE" : "DISABLED"}
              </Badge>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Gateway Status</Label>
                <Select value={nowPaymentsEnabled} onValueChange={setNowPaymentsEnabled}>
                  <SelectTrigger className={nowPaymentsEnabled === "true" ? "border-emerald-500/50 text-emerald-300 bg-emerald-500/10" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Enabled (Automated)</SelectItem>
                    <SelectItem value="false">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <Input 
                  type="password" 
                  value={nowPaymentsApiKey} 
                  onChange={(e) => setNowPaymentsApiKey(e.target.value)} 
                  placeholder="NP-XXXXXXXX-XXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label>IPN Secret Key</Label>
                <Input 
                  type="password" 
                  value={nowPaymentsIpn} 
                  onChange={(e) => setNowPaymentsIpn(e.target.value)} 
                  placeholder="Enter IPN Secret for Webhooks"
                />
              </div>
            </div>
          </Card>

          {/* CoinPayments Box */}
          <Card className="glass-card p-6 border-sky-500/20 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-sky-400">
                <Bitcoin className="h-5 w-5" /> CoinPayments API
              </h2>
              <Badge variant={coinPaymentsEnabled === "true" ? "success" : "secondary"}>
                {coinPaymentsEnabled === "true" ? "ACTIVE" : "DISABLED"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Gateway Status</Label>
                <Select value={coinPaymentsEnabled} onValueChange={setCoinPaymentsEnabled}>
                  <SelectTrigger className={coinPaymentsEnabled === "true" ? "border-emerald-500/50 text-emerald-300 bg-emerald-500/10" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Enabled (Automated)</SelectItem>
                    <SelectItem value="false">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Merchant ID</Label>
                <Input 
                  value={coinPaymentsMerchantId} 
                  onChange={(e) => setCoinPaymentsMerchantId(e.target.value)} 
                  placeholder="e.g. 8f7b...a2"
                />
              </div>

              <div className="space-y-2">
                <Label>IPN Secret</Label>
                <Input 
                  type="password" 
                  value={coinPaymentsIpn} 
                  onChange={(e) => setCoinPaymentsIpn(e.target.value)} 
                  placeholder="Must match your CP account settings"
                />
              </div>
            </div>
          </Card>

        </div>
      </form>
    </>
  );
}