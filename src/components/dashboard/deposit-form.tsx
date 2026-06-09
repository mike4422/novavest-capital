"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouteLoading } from "@/components/ui/loading/route-loading-provider";
import { createClient } from "@/lib/supabase/client";

export function DepositForm({ wallets }: { wallets: any[] }) {
  const router = useRouter();
  const { startRouteLoading, stopRouteLoading } = useRouteLoading();
  const [network, setNetwork] = useState(wallets?.[0]?.network || "TRC20");
  const [loading, setLoading] = useState(false);
  const wallet = useMemo(() => wallets.find((item) => item.network === network), [wallets, network]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      setLoading(true);
      let proofUrl = String(formData.get("proofUrl") || "");
      const file = formData.get("proof") as File | null;

      if (file && file.size) {
        const supabase = createClient();
        const path = `${crypto.randomUUID()}-${file.name}`;
        const { error } = await supabase.storage.from("payment-proofs").upload(path, file, { upsert: false });
        if (error) {
          toast.error(error.message);
          return;
        }
        const { data } = supabase.storage.from("payment-proofs").getPublicUrl(path);
        proofUrl = data.publicUrl;
      }

      const res = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(formData.get("amount")),
          network,
          asset: wallet?.asset || "USDT",
          proofUrl,
          txHash: String(formData.get("txHash") || "")
        })
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Deposit submission failed.");
        return;
      }

      toast.success("Deposit submitted for admin review.");
      startRouteLoading("Refreshing deposit history...");
      router.refresh();
      event.currentTarget.reset();
    } catch {
      toast.error("Deposit submission failed. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(stopRouteLoading, 500);
    }
  }

  return (
    <Card className="glass-card p-6">
      <p className="text-2xl font-black text-white">Deposit crypto</p>
      <p className="mt-2 text-sm text-slate-400">Select a network, send funds, then upload your proof for review.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        
        {/* FIXED SELECT DROPDOWN STYLING */}
        <div className="space-y-2">
          <Label className="text-slate-300">Crypto network</Label>
          <Select value={network} onValueChange={(value) => setNetwork(value)} disabled={loading}>
            <SelectTrigger className="w-full bg-slate-900 border border-white/10 text-white">
              <SelectValue placeholder="Select a network" />
            </SelectTrigger>
            
            {/* Added solid background, border, and high z-index to prevent overlay issues */}
            <SelectContent className="bg-slate-950 border border-white/10 text-slate-200 z-[100] shadow-2xl">
              {wallets.map((item) => (
                <SelectItem 
                  key={item.id} 
                  value={item.network}
                  className="focus:bg-white/10 focus:text-white cursor-pointer"
                >
                  {item.asset} {item.network}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-2xl border border-teal-500/20 bg-teal-500/10 p-5">
          <p className="text-sm text-slate-300">Send only {wallet?.asset} on {wallet?.network} to this address</p>
          <p className="mt-3 break-all font-mono text-sm font-bold text-teal-300">{wallet?.address || "Wallet address not configured"}</p>
          {wallet?.minimum_deposit && <p className="mt-3 text-xs text-teal-200/60">Minimum deposit: ${wallet.minimum_deposit}</p>}
        </div>
        
        <div className="space-y-2">
          <Label className="text-slate-300">Deposit amount (USD)</Label>
          <Input className="bg-slate-900 border-white/10 text-white" name="amount" type="number" min={wallet?.minimum_deposit || 1} step="0.01" required disabled={loading} />
        </div>
        
        <div className="space-y-2">
          <Label className="text-slate-300">Transaction hash (optional)</Label>
          <Input className="bg-slate-900 border-white/10 text-white" name="txHash" placeholder="Blockchain transaction hash" disabled={loading} />
        </div>
        
        <div className="space-y-2">
          <Label className="text-slate-300">Payment proof screenshot</Label>
          <Input className="bg-slate-900 border-white/10 text-white file:text-white" name="proof" type="file" accept="image/*,.pdf" disabled={loading} />
        </div>
        
        <div className="space-y-2">
          <Label className="text-slate-300">Or proof URL</Label>
          <Input className="bg-slate-900 border-white/10 text-white" name="proofUrl" placeholder="https://..." disabled={loading} />
        </div>
        
        <Button loading={loading} loadingText="Submitting deposit..." disabled={!wallet?.enabled} className="w-full" variant="premium">
          Submit Deposit
        </Button>
      </form>
    </Card>
  );
}