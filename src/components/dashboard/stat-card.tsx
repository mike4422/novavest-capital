import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({ label, value, icon: Icon, trend }: { label: string; value: string; icon: LucideIcon; trend?: string }) {
  return (
    <Card className="glass-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
          {trend && <p className="mt-2 text-xs text-teal-300">{trend}</p>}
        </div>
        <div className="rounded-2xl bg-teal-300/10 p-3 text-teal-300"><Icon className="h-5 w-5" /></div>
      </div>
    </Card>
  );
}
