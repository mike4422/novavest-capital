import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLogsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(100);
  return <><AdminHeader title="System Logs" subtitle="Audit trail for security, admin actions, deposits, withdrawals, and suspicious activity." /><div className="p-4 md:p-8"><Card className="glass-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr className="border-b border-white/10"><th className="p-4">Action</th><th className="p-4">Actor</th><th className="p-4">IP</th><th className="p-4">Metadata</th><th className="p-4">Date</th></tr></thead><tbody>{(data || []).map((log: any) => <tr key={log.id} className="border-b border-white/5"><td className="p-4"><Badge variant="secondary">{log.action}</Badge></td><td className="p-4 font-mono text-xs">{log.actor_id || "system"}</td><td className="p-4 text-slate-400">{log.ip_address || "-"}</td><td className="p-4 max-w-md truncate font-mono text-xs text-slate-500">{JSON.stringify(log.metadata || {})}</td><td className="p-4 text-slate-400">{new Date(log.created_at).toLocaleString()}</td></tr>)}</tbody></table></div></Card></div></>;
}
