import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ActiveInvestmentsTable } from "@/components/dashboard/active-investments-table";
import { InvestmentActionCard } from "@/components/dashboard/investment-action-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { investmentPlans, roiPercent } from "@/lib/plans";
import { formatCurrency } from "@/lib/utils";

export default async function InvestmentsPage() {
  const { supabase, user } = await requireUser();
  const { data: investments } = await supabase.from("investments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  return (
    <>
      <DashboardHeader title="Investments" subtitle="Create, track, reinvest, and monitor all investment plans." />
      <div className="space-y-6 p-4 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[.75fr_1.25fr]">
          <InvestmentActionCard />
          <Card className="glass-card overflow-hidden">
            <div className="border-b border-white/10 p-6"><p className="text-xl font-bold">Plan comparison</p><p className="text-sm text-slate-400">Compare ROI, duration, and capital requirements.</p></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="text-xs uppercase text-slate-500"><tr className="border-b border-white/10"><th className="p-4">Plan</th><th className="p-4">Invest</th><th className="p-4">Return</th><th className="p-4">Profit</th><th className="p-4">ROI</th><th className="p-4">Duration</th></tr></thead>
                <tbody>{investmentPlans.map((plan) => <tr key={plan.slug} className="border-b border-white/5"><td className="p-4 font-semibold">{plan.name}</td><td className="p-4">{formatCurrency(plan.invest)}</td><td className="p-4 text-teal-300">{formatCurrency(plan.returnAmount)}</td><td className="p-4 text-violet-300">{formatCurrency(plan.profit)}</td><td className="p-4">{roiPercent(plan).toFixed(2)}%</td><td className="p-4">{plan.durationHours / 24} day(s)</td></tr>)}</tbody>
              </table>
            </div>
          </Card>
        </div>
        <ActiveInvestmentsTable investments={(investments || []).filter((item: any) => item.status !== "COMPLETED") as any} />
        <Card className="glass-card overflow-hidden">
          <div className="border-b border-white/10 p-6"><p className="text-xl font-bold">Completed / archived investments</p></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr className="border-b border-white/10"><th className="p-4">Plan</th><th className="p-4">Amount</th><th className="p-4">Profit</th><th className="p-4">Status</th><th className="p-4">Created</th></tr></thead><tbody>{(investments || []).map((item: any) => <tr key={item.id} className="border-b border-white/5"><td className="p-4 font-semibold">{item.plan_name}</td><td className="p-4">{formatCurrency(item.amount)}</td><td className="p-4 text-teal-300">{formatCurrency(item.expected_profit)}</td><td className="p-4"><Badge variant={item.status === "COMPLETED" ? "success" : "secondary"}>{item.status}</Badge></td><td className="p-4 text-slate-400">{new Date(item.created_at).toLocaleString()}</td></tr>)}</tbody></table></div>
        </Card>
      </div>
    </>
  );
}
