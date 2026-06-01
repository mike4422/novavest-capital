import { Copy, Gift } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { appConfig } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export default async function ReferralsPage() {
  const { supabase, user } = await requireUser();
  const [{ data: profile }, { data: referrals }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("referrals").select("*, referred:profiles!referrals_referred_id_fkey(full_name,email,created_at)").eq("referrer_id", user.id).order("created_at", { ascending: false })
  ]);
  const link = `${appConfig.url}/register?ref=${profile?.referral_code || ""}`;

  return (
    <>
      <DashboardHeader title="Referral Program" subtitle="Invite investors and track commission performance." />
      <div className="space-y-6 p-4 md:p-8">
        <Card className="glass-card p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_.5fr] lg:items-center">
            <div><Badge className="mb-4"><Gift className="mr-2 h-3 w-3" /> Affiliate engine</Badge><h2 className="text-3xl font-black">Your referral link</h2><p className="mt-3 break-all rounded-2xl border border-white/10 bg-white/5 p-4 font-mono text-sm text-teal-100">{link}</p></div>
            <div className="rounded-3xl bg-white/5 p-6"><p className="text-sm text-slate-400">Referral earnings</p><p className="mt-2 text-4xl font-black text-teal-200">{formatCurrency(profile?.referral_earnings)}</p><p className="mt-2 text-xs text-slate-500">Commission tracking is stored in the referrals table.</p></div>
          </div>
        </Card>
        <Card className="glass-card overflow-hidden">
          <div className="border-b border-white/10 p-6"><p className="text-xl font-bold">Users registered with your link</p></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr className="border-b border-white/10"><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Commission</th><th className="p-4">Status</th><th className="p-4">Joined</th></tr></thead><tbody>{(referrals || []).map((r: any) => <tr key={r.id} className="border-b border-white/5"><td className="p-4 font-semibold">{r.referred?.full_name || "Investor"}</td><td className="p-4 text-slate-400">{r.referred?.email}</td><td className="p-4 text-teal-300">{formatCurrency(r.commission_amount)}</td><td className="p-4"><Badge variant="secondary">{r.status}</Badge></td><td className="p-4 text-slate-400">{new Date(r.created_at).toLocaleString()}</td></tr>)}{(!referrals || referrals.length === 0) && <tr><td className="p-8 text-center text-slate-400" colSpan={5}>No referrals yet.</td></tr>}</tbody></table></div>
        </Card>
      </div>
    </>
  );
}
