import { Activity, ArrowDownLeft, ArrowUpRight, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RecentActivity({ items }: { items: any[] }) {
  const fallback = [
    { type: "deposit", title: "Deposit pending review", amount: "$1,000", created_at: new Date().toISOString() },
    { type: "investment", title: "Starter plan created", amount: "$100", created_at: new Date().toISOString() },
    { type: "withdrawal", title: "Withdrawal request submitted", amount: "$250", created_at: new Date().toISOString() }
  ];
  const rows = items.length ? items : fallback;
  const iconMap: Record<string, any> = { deposit: ArrowDownLeft, withdrawal: ArrowUpRight, investment: Activity };

  return (
    <Card className="glass-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xl font-bold">Recent activity</p>
          <p className="text-sm text-slate-400">Deposits, withdrawals, payouts, and notifications.</p>
        </div>
        <Bell className="h-5 w-5 text-teal-300" />
      </div>
      <div className="grid gap-3">
        {rows.slice(0, 6).map((item, index) => {
          const Icon = iconMap[item.type] || Activity;
          return (
            <div key={item.id || index} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-2 text-teal-300"><Icon className="h-4 w-4" /></div>
                <div><p className="text-sm font-semibold">{item.title || item.type}</p><p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p></div>
              </div>
              <Badge variant="secondary">{item.amount || item.status || "New"}</Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
