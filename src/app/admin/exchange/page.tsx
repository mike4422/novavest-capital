"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowRightLeft, Search, History, RefreshCcw } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

const ASSETS = ["USD", "BTC", "ETH", "USDT", "LTC", "SOL"];

export default function ExchangePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  
  // Ledger State
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  // Form State
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [fromAsset, setFromAsset] = useState("USD");
  const [toAsset, setToAsset] = useState("BTC");

  useEffect(() => {
    fetchExchanges();
    fetchUsers();
  }, [supabase]);

  async function fetchExchanges() {
    setFetching(true);
    const { data } = await supabase
      .from("transactions")
      .select("*, profiles(full_name, email)")
      .eq("type", "EXCHANGE")
      .order("created_at", { ascending: false })
      .limit(50);
    
    if (data) setExchanges(data);
    setFetching(false);
  }

  async function fetchUsers() {
    const { data } = await supabase.from("profiles").select("id, email, full_name").limit(100);
    if (data) setUsers(data);
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedUser) return toast.error("Please select a user first.");
    if (fromAsset === toAsset) return toast.error("Cannot exchange an asset for itself.");

    const formData = new FormData(e.currentTarget);
    const amount = formData.get("amount");
    const rate = formData.get("rate");

    if (!confirm(`Are you sure you want to record an exchange of ${amount} ${fromAsset} to ${toAsset} for ${selectedUser.full_name}?`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          fromAsset,
          toAsset,
          amount,
          rate,
          fee: formData.get("fee")
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
      e.currentTarget.reset();
      fetchExchanges(); // Refresh the ledger automatically
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AdminHeader 
        title="Asset Exchange" 
        subtitle="Monitor currency swaps and manually record exchanges for users." 
      />
      
      <div className="p-4 md:p-8 grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
        
        {/* Left Column: Exchange Ledger */}
        <Card className="glass-card flex flex-col order-2 xl:order-1">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <h2 className="font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-sky-400" /> Exchange History
            </h2>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase text-slate-400">
                <tr>
                  <th className="p-4 border-b border-white/10">Date & User</th>
                  <th className="p-4 border-b border-white/10">Swap Details</th>
                  <th className="p-4 border-b border-white/10 text-right">Rate & Fee</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr><td colSpan={3} className="p-12 text-center text-slate-500">Loading ledger...</td></tr>
                ) : exchanges.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-12 text-center">
                      <RefreshCcw className="h-8 w-8 text-slate-500 mx-auto mb-3 opacity-50" />
                      <p className="text-slate-400 text-lg">No exchanges recorded.</p>
                      <p className="text-slate-500 text-sm mt-1">Currency swaps will appear here.</p>
                    </td>
                  </tr>
                ) : (
                  exchanges.map((tx: any) => (
                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4">
                        <div className="font-bold text-white">{tx.profiles?.full_name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{new Date(tx.created_at).toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 font-mono text-sm">
                          <span className="text-rose-400 font-bold">{tx.amount} <span className="text-xs">{tx.asset}</span></span>
                          <ArrowRightLeft className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-emerald-400 font-bold">{tx.metadata?.final_received || tx.metadata?.converted_amount} <span className="text-xs">{tx.metadata?.to_asset}</span></span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="text-xs text-slate-300 font-mono">Rate: {tx.metadata?.exchange_rate}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Fee: {tx.metadata?.fee_deducted || 0}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right Column: Record Manual Exchange */}
        <div className="space-y-6 order-1 xl:order-2">
          <Card className="glass-card p-6 border-sky-500/20">
            <h2 className="font-bold flex items-center gap-2 mb-6 text-sky-400">
              <RefreshCcw className="h-5 w-5" /> Record Manual Swap
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>1. Search User</Label>
                <Input 
                  placeholder="Name or email..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && !selectedUser && (
                  <div className="max-h-[150px] overflow-y-auto space-y-1 custom-scrollbar mt-2 border border-white/10 rounded-lg p-1 bg-slate-950">
                    {filteredUsers.map(user => (
                      <div 
                        key={user.id} 
                        onClick={() => setSelectedUser(user)}
                        className="p-2 rounded hover:bg-white/10 cursor-pointer text-xs"
                      >
                        <span className="font-bold text-white">{user.full_name}</span> - <span className="text-slate-400">{user.email}</span>
                      </div>
                    ))}
                  </div>
                )}
                {selectedUser && (
                  <div className="flex justify-between items-center p-2 mt-2 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sm">
                    <span className="font-bold text-sky-100">{selectedUser.full_name}</span>
                    <button type="button" onClick={() => setSelectedUser(null)} className="text-xs text-rose-400 hover:text-rose-300">Change</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Asset</Label>
                  <Select value={fromAsset} onValueChange={setFromAsset}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ASSETS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>To Asset</Label>
                  <Select value={toAsset} onValueChange={setToAsset}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ASSETS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Amount to Convert (in {fromAsset})</Label>
                <Input name="amount" type="number" step="0.000001" required placeholder="0.00" className="font-mono" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Exchange Rate</Label>
                  <Input name="rate" type="number" step="0.000001" required placeholder="e.g. 0.00002" className="font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>Fee (in {toAsset})</Label>
                  <Input name="fee" type="number" step="0.000001" defaultValue="0" className="font-mono" />
                </div>
              </div>

              <Button type="submit" variant="premium" className="w-full mt-2" loading={loading}>
                <ArrowRightLeft className="h-4 w-4 mr-2" /> Log Exchange
              </Button>
            </form>
          </Card>
        </div>

      </div>
    </>
  );
}