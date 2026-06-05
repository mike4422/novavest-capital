"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { investmentPlans } from "@/lib/plans";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useRouteLoading } from "@/components/ui/loading/route-loading-provider";

export function InvestmentActionCard() {
  const router = useRouter();
  const { startRouteLoading, stopRouteLoading } = useRouteLoading();
  const [plan, setPlan] = useState(investmentPlans[0].slug);
  const [loading, setLoading] = useState(false);
  const selected = investmentPlans.find((item) => item.slug === plan)!;

  async function createInvestment() {
    try {
      setLoading(true);
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug: plan })
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Unable to create investment.");
        return;
      }

      toast.success("Investment created successfully.");
      startRouteLoading("Refreshing active investments...");
      router.refresh();
    } catch {
      toast.error("Unable to create investment. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(stopRouteLoading, 500);
    }
  }

  return (
    <Card className="glass-card p-6">
      <p className="text-xl font-bold">Investment calculator</p>
      <p className="mt-2 text-sm text-slate-400">Select a plan and preview your capital, profit, and return.</p>
      <div className="mt-5 space-y-4">
       <Select value={plan} onValueChange={setPlan} disabled={loading}>
          {investmentPlans.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
        </Select>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white/5 p-3"><p className="text-xs text-slate-500">Invest</p><p className="font-bold">{formatCurrency(selected.invest)}</p></div>
          <div className="rounded-2xl bg-white/5 p-3"><p className="text-xs text-slate-500">Profit</p><p className="font-bold text-teal-300">{formatCurrency(selected.profit)}</p></div>
          <div className="rounded-2xl bg-white/5 p-3"><p className="text-xs text-slate-500">Return</p><p className="font-bold text-violet-300">{formatCurrency(selected.returnAmount)}</p></div>
        </div>
        <Button loading={loading} loadingText="Creating investment..." onClick={createInvestment} className="w-full" variant="premium">Invest Now</Button>
      </div>
    </Card>
  );
}
