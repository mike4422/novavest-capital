import { AdminHeader } from "@/components/admin/admin-header";
import { WalletEditor } from "@/components/admin/wallet-editor";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";

export default async function AdminWalletsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("wallets").select("*").order("asset");
  return <><AdminHeader title="Wallet Address Management" subtitle="Update platform wallet addresses, QR codes, network status, and minimum deposit limits." /><div className="p-4 md:p-8"><Card className="glass-card p-6"><div className="grid gap-4">{(data || []).map((wallet: any) => <WalletEditor key={wallet.id} wallet={wallet} />)}</div></Card></div></>;
}
