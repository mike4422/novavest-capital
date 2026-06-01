import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DepositForm } from "@/components/dashboard/deposit-form";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export default async function DepositPage() {
  const { supabase, user } = await requireUser();
  const [{ data: wallets }, { data: deposits }] = await Promise.all([
    supabase.from("wallets").select("*").eq("enabled", true).order("asset"),
    supabase.from("deposits").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10)
  ]);

  return (
    <>
      <DashboardHeader title="Deposit Crypto" subtitle="Fund your wallet and submit proof for secure admin review." />
      <div className="grid gap-6 p-4 md:p-8 xl:grid-cols-[.8fr_1.2fr]">
        <DepositForm wallets={wallets || []} />
        <Card className="glass-card overflow-hidden">
          <div className="border-b border-white/10 p-6"><p className="text-xl font-bold">Deposit history</p><p className="text-sm text-slate-400">Latest pending and approved deposits.</p></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500"><tr className="border-b border-white/10"><th className="p-4">Network</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4">Date</th></tr></thead>
              <tbody>
                {(deposits || []).map((item: any) => <tr key={item.id} className="border-b border-white/5"><td className="p-4">{item.asset} {item.network}</td><td className="p-4">{formatCurrency(item.amount)}</td><td className="p-4"><Badge variant={item.status === "APPROVED" ? "success" : item.status === "REJECTED" ? "destructive" : "warning"}>{item.status}</Badge></td><td className="p-4 text-slate-400">{new Date(item.created_at).toLocaleString()}</td></tr>)}
                {(!deposits || deposits.length === 0) && <tr><td colSpan={4} className="p-8 text-center text-slate-400">No deposits yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
