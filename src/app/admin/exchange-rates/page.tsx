"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { RefreshCcw, Save, DollarSign, Percent, Plus, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ExchangeRatesPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // General Settings
  const [autoUpdate, setAutoUpdate] = useState("false");
  const [feePercent, setFeePercent] = useState("2");

  // Dynamic Rates Array for easier form handling
  const [rates, setRates] = useState<{ asset: string; price: number }[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/exchange-rates");
      const json = await res.json();
      
      if (json.ok && json.settings) {
        setAutoUpdate(json.settings.autoUpdate ? "true" : "false");
        setFeePercent(String(json.settings.feePercent || 0));
        
        // Convert the JSON object into an array for the UI editor
        const ratesObj = json.settings.rates || { BTC: 65000, ETH: 3500, USDT: 1 };
        const ratesArray = Object.entries(ratesObj).map(([asset, price]) => ({
          asset,
          price: Number(price)
        }));
        setRates(ratesArray);
      }
    } catch (err) {
      toast.error("Failed to load exchange rates.");
    } finally {
      setFetching(false);
    }
  }

  function handleRateChange(index: number, field: "asset" | "price", value: string) {
    const newRates = [...rates];
    if (field === "asset") {
      newRates[index].asset = value.toUpperCase();
    } else {
      newRates[index].price = Number(value);
    }
    setRates(newRates);
  }

  function addRate() {
    setRates([...rates, { asset: "NEW", price: 0 }]);
  }

  function removeRate(index: number) {
    const newRates = rates.filter((_, i) => i !== index);
    setRates(newRates);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Convert the array back into a neat object for the database
    const ratesObj: Record<string, number> = {};
    rates.forEach((r) => {
      if (r.asset.trim() !== "") {
        ratesObj[r.asset] = r.price;
      }
    });

    const payload = {
      autoUpdate: autoUpdate === "true",
      feePercent: Number(feePercent),
      rates: ratesObj
    };

    try {
      const res = await fetch("/api/admin/exchange-rates", {
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
    return <div className="p-12 text-center text-slate-500">Loading exchange rates...</div>;
  }

  return (
    <>
      <AdminHeader 
        title="Exchange Rates" 
        subtitle="Manage fiat to crypto conversion values and global swapping fees." 
      />
      
      <form onSubmit={handleSave} className="p-4 md:p-8 space-y-8 max-w-5xl">
        
        {/* Top Bar with Save Button */}
        <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-white/10">
          <p className="text-sm text-slate-400">Set internal currency valuations for deposits and the exchange ledger.</p>
          <Button type="submit" variant="premium" loading={loading}>
            <Save className="h-4 w-4 mr-2" /> Save Rates
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* General Policies Box */}
          <Card className="glass-card p-6 border-indigo-500/20 lg:col-span-1 h-fit">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-400">
                <RefreshCcw className="h-5 w-5" /> Conversion Policy
              </h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Rate Source</Label>
                <Select value={autoUpdate} onValueChange={setAutoUpdate}>
                  <SelectTrigger className={autoUpdate === "true" ? "border-emerald-500/50 text-emerald-300 bg-emerald-500/10" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Manual (Fixed Rates Below)</SelectItem>
                    <SelectItem value="true">Live (CoinGecko API) - Coming Soon</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-slate-500">
                  When manual is selected, the system will rigidly enforce the USD values you set to the right.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <Label className="flex items-center gap-2 text-rose-400">
                  <Percent className="h-4 w-4" /> Global Exchange Fee (%)
                </Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={feePercent} 
                  onChange={(e) => setFeePercent(e.target.value)} 
                />
                <p className="text-[10px] text-slate-500">
                  This percentage is automatically deducted as profit when a user converts assets in the Exchange tab.
                </p>
              </div>
            </div>
          </Card>

          {/* Rate Matrix Box */}
          <Card className="glass-card p-6 border-emerald-500/20 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-emerald-400">
                <DollarSign className="h-5 w-5" /> Asset Valuations (USD)
              </h2>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
                {rates.length} Assets
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-[120px_1fr_40px] gap-3 text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                <div>Ticker</div>
                <div>USD Value (Price)</div>
                <div></div>
              </div>

              {rates.map((rate, index) => (
                <div key={index} className="grid grid-cols-[120px_1fr_auto] gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <Input 
                    value={rate.asset} 
                    onChange={(e) => handleRateChange(index, "asset", e.target.value)} 
                    placeholder="BTC"
                    className="font-bold text-white bg-slate-900"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-emerald-400/50">$</span>
                    <Input 
                      type="number" 
                      step="0.00000001" 
                      min="0"
                      value={rate.price} 
                      onChange={(e) => handleRateChange(index, "price", e.target.value)} 
                      className="pl-7 font-mono text-emerald-400 bg-slate-900"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeRate(index)}
                    className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button 
                type="button" 
                variant="outline" 
                className="w-full mt-4 border-dashed border-white/20 text-slate-400 hover:text-white"
                onClick={addRate}
              >
                <Plus className="h-4 w-4 mr-2" /> Track New Asset
              </Button>
            </div>
          </Card>

        </div>
      </form>
    </>
  );
}