import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export default async function AdminInvestmentsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("investments").select("*, profiles(full_name,email)").order("created_at", { ascending: false });
  return <><AdminHeader title="All Investments" subtitle="View and manage investment plans across all users." /><div className="p-4 md:p-8"><Card className="glass-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr className="border-b border-white/10"><th className="p-4">User</th><th className="p-4">Plan</th><th className="p-4">Amount</th><th className="p-4">Profit</th><th className="p-4">ROI</th><th className="p-4">Status</th><th className="p-4">End Date</th></tr></thead><tbody>{(data || []).map((item: any) => <tr key={item.id} className="border-b border-white/5"><td className="p-4"><p className="font-semibold">{item.profiles?.full_name}</p><p className="text-xs text-slate-500">{item.profiles?.email}</p></td><td className="p-4">{item.plan_name}</td><td className="p-4">{formatCurrency(item.amount)}</td><td className="p-4 text-teal-300">{formatCurrency(item.expected_profit)}</td><td className="p-4">{item.roi_percent}%</td><td className="p-4"><Badge variant={item.status === "COMPLETED" ? "success" : "secondary"}>{item.status}</Badge></td><td className="p-4 text-slate-400">{new Date(item.end_date).toLocaleString()}</td></tr>)}</tbody></table></div></Card></div></>;
}
