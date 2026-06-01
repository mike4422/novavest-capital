"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supportedNetworks } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useRouteLoading } from "@/components/ui/loading/route-loading-provider";

export function WithdrawForm({ balance }: { balance: number }) {
  const router = useRouter();
  const { startRouteLoading, stopRouteLoading } = useRouteLoading();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      setLoading(true);
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(formData.get("amount")),
          asset: String(formData.get("asset")),
          network: String(formData.get("network")),
          walletAddress: String(formData.get("walletAddress"))
        })
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Withdrawal request failed.");
        return;
      }

      toast.success("Withdrawal request submitted.");
      startRouteLoading("Refreshing withdrawal history...");
      router.refresh();
      event.currentTarget.reset();
    } catch {
      toast.error("Withdrawal request failed. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(stopRouteLoading, 500);
    }
  }

  return (
    <Card className="glass-card p-6">
      <p className="text-2xl font-black">Request withdrawal</p>
      <p className="mt-2 text-sm text-slate-400">Available balance: <b className="text-teal-200">${balance.toLocaleString()}</b></p>
      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Asset</Label><Select name="asset" defaultValue="USDT" disabled={loading}>{supportedNetworks.map((n) => <option key={n.name} value={n.symbol}>{n.symbol}</option>)}</Select></div>
          <div className="space-y-2"><Label>Network</Label><Select name="network" defaultValue="TRC20" disabled={loading}>{supportedNetworks.map((n) => <option key={n.name} value={n.network}>{n.network}</option>)}</Select></div>
        </div>
        <div className="space-y-2"><Label>Amount (USD)</Label><Input name="amount" type="number" min="1" max={balance} step="0.01" required disabled={loading} /></div>
        <div className="space-y-2"><Label>Receiving wallet address</Label><Input name="walletAddress" required placeholder="Paste your wallet address" disabled={loading} /></div>
        <Button loading={loading} loadingText="Submitting withdrawal..." className="w-full" variant="premium">Submit Withdrawal</Button>
      </form>
    </Card>
  );
}
