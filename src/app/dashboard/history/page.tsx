import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export default async function HistoryPage() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  return (
    <>
      <DashboardHeader title="Transaction History" subtitle="Exportable record of deposits, withdrawals, investments, and payouts." />
      <div className="p-4 md:p-8"><Card className="glass-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr className="border-b border-white/10"><th className="p-4">Type</th><th className="p-4">Amount</th><th className="p-4">Asset</th><th className="p-4">Status</th><th className="p-4">Reference</th><th className="p-4">Date</th></tr></thead><tbody>{(data || []).map((item: any) => <tr key={item.id} className="border-b border-white/5"><td className="p-4 font-semibold">{item.type}</td><td className="p-4">{formatCurrency(item.amount)}</td><td className="p-4">{item.asset}</td><td className="p-4"><Badge variant={item.status === "COMPLETED" ? "success" : "secondary"}>{item.status}</Badge></td><td className="p-4 font-mono text-xs text-slate-500">{item.reference}</td><td className="p-4 text-slate-400">{new Date(item.created_at).toLocaleString()}</td></tr>)}</tbody></table></div></Card></div>
    </>
  );
}
