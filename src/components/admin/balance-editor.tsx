"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouteLoading } from "@/components/ui/loading/route-loading-provider";

export function BalanceEditor({ userId }: { userId: string }) {
  const router = useRouter();
  const { startRouteLoading, stopRouteLoading } = useRouteLoading();
  const [amount, setAmount] = useState(0);
  const [loadingDirection, setLoadingDirection] = useState<"add" | "remove" | null>(null);

  async function updateBalance(direction: "add" | "remove") {
    try {
      setLoadingDirection(direction);
      const res = await fetch(`/api/admin/users/${userId}/balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, direction })
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Balance update failed.");
        return;
      }

      toast.success("Balance updated.");
      startRouteLoading("Refreshing user balance...");
      router.refresh();
    } catch {
      toast.error("Balance update failed. Please try again.");
    } finally {
      setLoadingDirection(null);
      setTimeout(stopRouteLoading, 500);
    }
  }

  return (
    <div className="flex min-w-64 items-center gap-2">
      <Input type="number" step="0.01" value={amount} disabled={Boolean(loadingDirection)} onChange={(e) => setAmount(Number(e.target.value))} />
      <Button size="sm" loading={loadingDirection === "add"} loadingText="Funding..." disabled={Boolean(loadingDirection)} onClick={() => updateBalance("add")}>Fund</Button>
      <Button size="sm" variant="outline" loading={loadingDirection === "remove"} loadingText="Removing..." disabled={Boolean(loadingDirection)} onClick={() => updateBalance("remove")}>Remove</Button>
    </div>
  );
}
