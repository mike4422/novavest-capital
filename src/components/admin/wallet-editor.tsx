"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WalletEditor({ wallet }: { wallet: any }) {
  const [address, setAddress] = useState(wallet.address || "");
  const [minimumDeposit, setMinimumDeposit] = useState(wallet.minimum_deposit || 0);
  const [enabled, setEnabled] = useState(Boolean(wallet.enabled));
  const [qrCodeUrl, setQrCodeUrl] = useState(wallet.qr_code_url || "");
  const [loading, setLoading] = useState(false);

  async function save() {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/wallets/${wallet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, minimumDeposit, enabled, qrCodeUrl })
      });
      const json = await res.json();

      if (!res.ok) toast.error(json.error || "Update failed.");
      else toast.success("Wallet updated.");
    } catch {
      toast.error("Wallet update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 lg:grid-cols-[.7fr_1.5fr_.5fr_.5fr_.4fr]">
      <div><p className="font-bold">{wallet.asset} {wallet.network}</p><p className="text-xs text-slate-500">{wallet.label}</p></div>
      <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Wallet address" disabled={loading} />
      <Input value={qrCodeUrl} onChange={(e) => setQrCodeUrl(e.target.value)} placeholder="QR code URL" disabled={loading} />
      <Input type="number" value={minimumDeposit} onChange={(e) => setMinimumDeposit(Number(e.target.value))} disabled={loading} />
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={enabled} disabled={loading} onChange={(e) => setEnabled(e.target.checked)} />
        <Button size="sm" loading={loading} loadingText="Saving..." onClick={save}>Save</Button>
      </div>
    </div>
  );
}
