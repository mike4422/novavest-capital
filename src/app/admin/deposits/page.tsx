import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatusActionButton } from "@/components/admin/admin-actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDepositsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("deposits").select("*, profiles(full_name,email)").order("created_at", { ascending: false });
  return <><AdminHeader title="Approve Deposits" subtitle="Review proof screenshots and credit user balances." /><div className="p-4 md:p-8"><Card className="glass-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr className="border-b border-white/10"><th className="p-4">User</th><th className="p-4">Network</th><th className="p-4">Amount</th><th className="p-4">Proof</th><th className="p-4">Status</th><th className="p-4">Date</th><th className="p-4">Action</th></tr></thead><tbody>{(data || []).map((item: any) => <tr key={item.id} className="border-b border-white/5"><td className="p-4"><p className="font-semibold">{item.profiles?.full_name}</p><p className="text-xs text-slate-500">{item.profiles?.email}</p></td><td className="p-4">{item.asset} {item.network}</td><td className="p-4 text-teal-300">{formatCurrency(item.amount)}</td><td className="p-4">{item.proof_url ? <Link href={item.proof_url} target="_blank" className="text-teal-300">View proof</Link> : "-"}</td><td className="p-4"><Badge variant={item.status === "APPROVED" ? "success" : item.status === "REJECTED" ? "destructive" : "warning"}>{item.status}</Badge></td><td className="p-4 text-slate-400">{new Date(item.created_at).toLocaleString()}</td><td className="p-4"><div className="flex gap-2">{item.status === "PENDING_REVIEW" && <><StatusActionButton endpoint={`/api/admin/deposits/${item.id}/approve`} label="Approve" /><StatusActionButton endpoint={`/api/admin/deposits/${item.id}/reject`} label="Reject" variant="destructive" /></>}</div></td></tr>)}</tbody></table></div></Card></div></>;
}
