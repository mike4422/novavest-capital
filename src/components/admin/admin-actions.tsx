"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouteLoading } from "@/components/ui/loading/route-loading-provider";

export function StatusActionButton({ endpoint, label, variant = "default" }: { endpoint: string; label: string; variant?: "default" | "destructive" | "outline" }) {
  const router = useRouter();
  const { startRouteLoading, stopRouteLoading } = useRouteLoading();
  const [loading, setLoading] = useState(false);

  async function run() {
    try {
      setLoading(true);
      const res = await fetch(endpoint, { method: "POST" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(json.error || "Action failed.");
        return;
      }

      toast.success(json.message || "Action completed.");
      startRouteLoading("Refreshing admin data...");
      router.refresh();
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(stopRouteLoading, 500);
    }
  }

  return <Button size="sm" variant={variant} onClick={run} loading={loading} loadingText="Processing...">{label}</Button>;
}
