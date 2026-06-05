import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Activity, Zap, CheckCircle2 } from "lucide-react";

export default async function EarningsPage() {
  const { supabase } = await requireAdmin();

  // Fetch the recent ROI/Profit payouts
  const { data: earningsData } = await supabase
    .from("transactions")
    .select(`
      id,
      amount,
      asset,
      created_at,
      metadata,
      profiles (full_name, email)
    `)
    .eq("type", "PAYOUT")
    .order("created_at", { ascending: false })
    .limit(200);

  const earnings = earningsData || [];

  // Calculate the total amount of profit distributed in this fetched batch
  const totalDistributed = earnings.reduce((sum, record) => sum + Number(record.amount), 0);

  return (
    <>
      <AdminHeader 
        title="ROI & Earnings Ledger" 
        subtitle="Track automated daily profits and investment returns distributed to your users." 
      />
      
      <div className="p-4 md:p-8 space-y-6">
        
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card p-6 border-teal-500/20 bg-teal-500/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">Total Payouts (Recent)</p>
                <p className="text-2xl font-black text-white">{formatCurrency(totalDistributed)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-teal-400" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6 border-violet-500/20 bg-violet-500/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-1">Earning Events</p>
                <p className="text-2xl font-black text-white">{earnings.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Activity className="h-6 w-6 text-violet-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Earnings Ledger Table */}
        <Card className="glass-card flex flex-col">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <h2 className="font-bold flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" /> Recent Profit Distributions
            </h2>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase text-slate-400">
                <tr>
                  <th className="p-4 border-b border-white/10">Date & Time</th>
                  <th className="p-4 border-b border-white/10">Investor</th>
                  <th className="p-4 border-b border-white/10 text-right">Profit Amount</th>
                  <th className="p-4 border-b border-white/10">Investment Plan / Details</th>
                </tr>
              </thead>
              <tbody>
                {earnings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center">
                      <Activity className="h-8 w-8 text-slate-500 mx-auto mb-3 opacity-50" />
                      <p className="text-slate-400 text-lg">No earnings distributed yet.</p>
                      <p className="text-slate-500 text-sm mt-1">When active investments generate daily ROI, they will appear here.</p>
                    </td>
                  </tr>
                ) : (
                  earnings.map((earning: any) => (
                    <tr key={earning.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      
                      {/* Date & Time */}
                      <td className="p-4 align-middle text-slate-400 text-xs">
                        <div className="font-medium text-slate-300">
                          {new Date(earning.created_at).toLocaleDateString()}
                        </div>
                        <div>
                          {new Date(earning.created_at).toLocaleTimeString()}
                        </div>
                      </td>

                      {/* Investor */}
                      <td className="p-4 align-middle">
                        <div className="font-bold text-white flex items-center gap-2">
                          {earning.profiles?.full_name || "Unknown"}
                          <Badge variant="success" className="text-[9px] h-4 px-1 border-none bg-emerald-500/20 text-emerald-300">
                            <CheckCircle2 className="h-3 w-3 mr-0.5" /> Credited
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{earning.profiles?.email}</div>
                      </td>

                      {/* Profit Amount */}
                      <td className="p-4 align-middle text-right">
                        <span className="font-mono font-bold text-base text-emerald-400">
                          +{formatCurrency(earning.amount)}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{earning.asset || 'USD'}</div>
                      </td>

                      {/* Details / Metadata */}
                      <td className="p-4 align-middle">
                        <div className="text-sm text-slate-300">
                          {earning.metadata?.description || "Daily Investment ROI"}
                        </div>
                        {earning.metadata?.plan_name && (
                          <div className="text-xs text-violet-400 mt-0.5 font-medium">
                            Plan: {earning.metadata.plan_name}
                          </div>
                        )}
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </>
  );
}