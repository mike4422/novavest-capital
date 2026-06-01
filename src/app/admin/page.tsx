import { Activity, ArrowDownLeft, ArrowUpRight, DollarSign, Users } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { PortfolioChart } from "@/components/dashboard/portfolio-chart";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export default async function AdminPage() {
  const { supabase } = await requireAdmin();
  const [{ count: users }, { data: deposits }, { data: withdrawals }, { data: investments }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("deposits").select("amount,status"),
    supabase.from("withdrawals").select("amount,status"),
    supabase.from("investments").select("amount,expected_profit,status")
  ]);
  const totalDeposits = (deposits || []).filter((d: any) => d.status === "APPROVED").reduce((s: number, d: any) => s + Number(d.amount || 0), 0);
  const pendingWithdrawals = (withdrawals || []).filter((w: any) => w.status === "PENDING_REVIEW").reduce((s: number, w: any) => s + Number(w.amount || 0), 0);
  const activeInvestments = (investments || []).filter((i: any) => i.status === "ACTIVE").reduce((s: number, i: any) => s + Number(i.amount || 0), 0);
  return (
    <>
      <AdminHeader title="Admin Analytics" subtitle="Enterprise-grade operational overview for NovaVest Capital." />
      <div className="space-y-6 p-4 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Users" value={String(users || 0)} icon={Users} trend="Registered investors" />
          <StatCard label="Approved Deposits" value={formatCurrency(totalDeposits)} icon={ArrowDownLeft} trend="Platform funding" />
          <StatCard label="Pending Withdrawals" value={formatCurrency(pendingWithdrawals)} icon={ArrowUpRight} trend="Needs review" />
          <StatCard label="Active Investment Capital" value={formatCurrency(activeInvestments)} icon={DollarSign} trend="Running plans" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><PortfolioChart /><Card className="glass-card p-6"><p className="text-xl font-bold">Smart admin insights</p><div className="mt-6 grid gap-3 text-sm text-slate-300"><p>• Review deposits with proof screenshots.</p><p>• Approve/reject withdrawals and auto-email users.</p><p>• Assign admin roles by email.</p><p>• Wallet management supports network enabling, QR codes, and limits.</p><p>• Audit logs store critical admin activity.</p></div></Card></div>
      </div>
    </>
  );
}
