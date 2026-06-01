import { AdminHeader } from "@/components/admin/admin-header";
import { BalanceEditor } from "@/components/admin/balance-editor";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export default async function AdminUsersPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  return <><AdminHeader title="Manage Users" subtitle="Search, edit balances, fund accounts, suspend users, and view investor profiles." /><div className="p-4 md:p-8"><Card className="glass-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr className="border-b border-white/10"><th className="p-4">User</th><th className="p-4">Email</th><th className="p-4">Balance</th><th className="p-4">Referral</th><th className="p-4">Status</th><th className="p-4">Joined</th><th className="p-4">Balance Actions</th></tr></thead><tbody>{(data || []).map((user: any) => <tr key={user.id} className="border-b border-white/5"><td className="p-4 font-semibold">{user.full_name}</td><td className="p-4 text-slate-400">{user.email}</td><td className="p-4 text-teal-300">{formatCurrency(user.balance)}</td><td className="p-4 font-mono text-xs">{user.referral_code}</td><td className="p-4"><Badge variant={user.status === "ACTIVE" ? "success" : "warning"}>{user.status}</Badge></td><td className="p-4 text-slate-400">{new Date(user.created_at).toLocaleString()}</td><td className="p-4"><BalanceEditor userId={user.id} /></td></tr>)}</tbody></table></div></Card></div></>;
}
