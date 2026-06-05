"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Hourglass, Search, CalendarOff, ArrowUpRight, Clock, ShieldAlert } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ExpiringDepositsPage() {
  const [loading, setLoading] = useState(true);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchExpiringDeposits();
  }, []);

  async function fetchExpiringDeposits() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/expiring-deposits");
      const json = await res.json();
      if (json.ok && json.deposits) {
        setDeposits(json.deposits);
      }
    } catch (err) {
      toast.error("Failed to load expiring deposits.");
    } finally {
      setLoading(false);
    }
  }

  // Filter based on User Email, Name, or Plan Name
  const filteredDeposits = deposits.filter(deposit => {
    const query = searchQuery.toLowerCase();
    const matchEmail = deposit.profiles?.email?.toLowerCase().includes(query);
    const matchName = deposit.profiles?.full_name?.toLowerCase().includes(query);
    const matchPlan = deposit.plan_name?.toLowerCase().includes(query);
    return matchEmail || matchName || matchPlan;
  });

  // Helper function to calculate days remaining
  function getDaysRemaining(expiresAt: string) {
    if (!expiresAt) return 999;
    const diffTime = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <>
      <AdminHeader 
        title="Expiring Deposits" 
        subtitle="Monitor active investments that are nearing the end of their lifecycle." 
      />
      
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        
        {/* Statistics & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
          <div className="flex gap-4">
            <Card className="glass-card p-4 border-white/10 flex-1 flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                <Hourglass className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Plans</p>
                <p className="text-2xl font-black">{deposits.length}</p>
              </div>
            </Card>
            
            <Card className="glass-card p-4 border-amber-500/20 flex-1 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Expiring {'<'} 7 Days</p>
                <p className="text-2xl font-black text-amber-400">
                  {deposits.filter(d => getDaysRemaining(d.expires_at) <= 7 && getDaysRemaining(d.expires_at) >= 0).length}
                </p>
              </div>
            </Card>
          </div>

          <Card className="glass-card p-4 border-white/10 flex flex-col justify-center">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Search user or plan..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-900 border-white/10"
              />
            </div>
          </Card>
        </div>

        {/* Expiring Ledger */}
        <Card className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-bold">Investor</th>
                  <th className="px-6 py-4 font-bold">Investment Detail</th>
                  <th className="px-6 py-4 font-bold">Timeline</th>
                  <th className="px-6 py-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      Loading active investments...
                    </td>
                  </tr>
                ) : filteredDeposits.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      <CalendarOff className="h-8 w-8 text-slate-600 mx-auto mb-3 opacity-50" />
                      <p>No expiring deposits found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredDeposits.map((deposit) => {
                    const daysRemaining = getDaysRemaining(deposit.expires_at);
                    const isCritical = daysRemaining <= 3 && daysRemaining >= 0;
                    
                    return (
                      <tr key={deposit.id} className="hover:bg-white/[0.02] transition-colors">
                        
                        {/* User Info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-200">
                              {deposit.profiles?.full_name || "Unknown User"}
                            </span>
                            <span className="text-xs text-slate-400">
                              {deposit.profiles?.email}
                            </span>
                          </div>
                        </td>

                        {/* Plan Detail */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-emerald-400 font-mono font-bold">
                              ${Number(deposit.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs text-slate-400 mt-1">
                              Plan: <span className="text-slate-300 font-medium">{deposit.plan_name}</span>
                            </span>
                          </div>
                        </td>

                        {/* Timeline */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {daysRemaining < 0 ? (
                              <Badge variant="secondary" className="bg-slate-500/10 text-slate-400 border-slate-500/20 w-fit">
                                Expired
                              </Badge>
                            ) : isCritical ? (
                              <Badge variant="destructive" className="bg-rose-500/10 text-rose-400 border-rose-500/20 w-fit animate-pulse">
                                <ShieldAlert className="h-3 w-3 mr-1" /> Expires in {daysRemaining} days
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-sky-500/10 text-sky-400 border-sky-500/20 w-fit">
                                Expires in {daysRemaining} days
                              </Badge>
                            )}
                            <span className="text-[10px] text-slate-500 font-mono mt-1">
                              End: {new Date(deposit.expires_at).toLocaleDateString()}
                            </span>
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button variant="outline" size="sm" className="text-slate-300 hover:text-white" onClick={() => toast.info("Navigate to User Profile to edit this deposit.")}>
                            View User <ArrowUpRight className="h-3 w-3 ml-1" />
                          </Button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </>
  );
}