import { Activity, ArrowDownLeft, ArrowUpRight, DollarSign, Gift, Landmark } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { PortfolioChart } from "@/components/dashboard/portfolio-chart";
import { ActiveInvestmentsTable } from "@/components/dashboard/active-investments-table";
import { InvestmentActionCard } from "@/components/dashboard/investment-action-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { requireUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const [{ data: profile }, { data: investments }, { data: deposits }, { data: withdrawals }, { data: transactions }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("investments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("deposits").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("withdrawals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(6)
  ]);

  const activeInvestments = (investments || []).filter((item: any) => ["ACTIVE", "PENDING"].includes(item.status));
  const profitEarned = (investments || []).filter((item: any) => item.status === "COMPLETED").reduce((sum: number, item: any) => sum + Number(item.expected_profit || 0), 0);
  const pendingWithdrawals = (withdrawals || []).filter((item: any) => item.status === "PENDING_REVIEW").reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);

  return (
    <>
      <DashboardHeader title="Investor Dashboard" subtitle={`Welcome back, ${profile?.full_name || user.email}`} />
      <div className="space-y-6 p-4 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Balance" value={formatCurrency(profile?.balance)} icon={DollarSign} trend="Available for investment or withdrawal" />
          <StatCard label="Active Investments" value={formatCurrency(activeInvestments.reduce((s: number, i: any) => s + Number(i.amount || 0), 0))} icon={Activity} trend={`${activeInvestments.length} running plan(s)`} />
          <StatCard label="Profit Earned" value={formatCurrency(profitEarned)} icon={Landmark} trend="Completed plans" />
          <StatCard label="Pending Withdrawals" value={formatCurrency(pendingWithdrawals)} icon={ArrowUpRight} trend="Awaiting admin review" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
          <PortfolioChart />
          <InvestmentActionCard />
        </div>
        <ActiveInvestmentsTable investments={activeInvestments as any} />
        <div className="grid gap-6 xl:grid-cols-2">
          <RecentActivity items={(transactions || []) as any[]} />
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Referral Earnings" value={formatCurrency(profile?.referral_earnings)} icon={Gift} trend="Affiliate engine ready" />
            <StatCard label="Total Deposits" value={formatCurrency((deposits || []).reduce((s: number, i: any) => s + Number(i.amount || 0), 0))} icon={ArrowDownLeft} trend="Recent deposits" />
          </div>
        </div>
      </div>
    </>
  );
}
