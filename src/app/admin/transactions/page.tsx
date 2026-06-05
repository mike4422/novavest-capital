import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Gift, Zap, ShieldAlert, Hash } from "lucide-react";

// Helper function to color-code and icon-map transaction types
function getTypeConfig(type: string) {
  switch (type.toUpperCase()) {
    case 'DEPOSIT': 
      return { icon: ArrowDownLeft, color: "text-emerald-400", bg: "bg-emerald-400/10", sign: "+" };
    case 'WITHDRAWAL': 
      return { icon: ArrowUpRight, color: "text-rose-400", bg: "bg-rose-400/10", sign: "-" };
    case 'PAYOUT': 
      return { icon: Zap, color: "text-violet-400", bg: "bg-violet-400/10", sign: "+" };
    case 'INVESTMENT': 
      return { icon: ArrowRightLeft, color: "text-sky-400", bg: "bg-sky-400/10", sign: "-" };
    case 'BONUS': 
      return { icon: Gift, color: "text-teal-400", bg: "bg-teal-400/10", sign: "+" };
    case 'PENALTY': 
      return { icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-500/10", sign: "-" };
    default: 
      return { icon: ArrowRightLeft, color: "text-slate-300", bg: "bg-slate-300/10", sign: "" };
  }
}

export default async function TransactionsPage() {
  const { supabase } = await requireAdmin();

  // Fetch the latest 150 transactions and instantly join the user's name and email
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      profiles(full_name, email)
    `)
    .order("created_at", { ascending: false })
    .limit(150);

  const transactions = data || [];

  return (
    <>
      <AdminHeader 
        title="Global Transactions" 
        subtitle="Master ledger of all system movements including deposits, payouts, and manual bonuses." 
      />
      
      <div className="p-4 md:p-8">
        <Card className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase text-slate-400">
                <tr>
                  <th className="p-4 border-b border-white/10 w-48">Date & Time</th>
                  <th className="p-4 border-b border-white/10 w-1/4">User Details</th>
                  <th className="p-4 border-b border-white/10">Type</th>
                  <th className="p-4 border-b border-white/10 text-right">Amount</th>
                  <th className="p-4 border-b border-white/10 text-center">Status</th>
                  <th className="p-4 border-b border-white/10 text-right">Reference ID</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400">
                      No transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx: any) => {
                    const config = getTypeConfig(tx.type);
                    const Icon = config.icon;
                    
                    return (
                      <tr key={tx.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        
                        {/* Date & Time */}
                        <td className="p-4 align-middle text-slate-400 text-xs">
                          <div className="font-medium text-slate-300">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </div>
                          <div>
                            {new Date(tx.created_at).toLocaleTimeString()}
                          </div>
                        </td>
                        
                        {/* User Info */}
                        <td className="p-4 align-middle">
                          {tx.profiles ? (
                            <>
                              <div className="font-bold text-white">{tx.profiles.full_name}</div>
                              <div className="text-xs text-slate-400">{tx.profiles.email}</div>
                            </>
                          ) : (
                            <span className="text-slate-500 italic">System or Deleted User</span>
                          )}
                        </td>

                        {/* Transaction Type */}
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-md ${config.bg}`}>
                              <Icon className={`h-4 w-4 ${config.color}`} />
                            </div>
                            <span className="font-bold text-slate-200 tracking-wide text-xs">
                              {tx.type.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="p-4 align-middle text-right">
                          <span className={`font-mono font-bold text-base ${config.color}`}>
                            {config.sign}{formatCurrency(tx.amount)}
                          </span>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{tx.asset}</div>
                        </td>

                        {/* Status */}
                        <td className="p-4 align-middle text-center">
                          {tx.status === 'COMPLETED' && <Badge variant="success" className="text-[10px] h-5 px-2">COMPLETED</Badge>}
                          {tx.status === 'PENDING' && <Badge variant="warning" className="text-[10px] h-5 px-2">PENDING</Badge>}
                          {(tx.status === 'FAILED' || tx.status === 'CANCELLED') && (
                            <Badge variant="destructive" className="text-[10px] h-5 px-2">{tx.status}</Badge>
                          )}
                        </td>

                        {/* Reference / ID */}
                        <td className="p-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                            <Hash className="h-3 w-3 text-slate-500" />
                            <span className="font-mono text-[10px] text-slate-400" title={tx.id}>
                              ...{tx.id.slice(-8)}
                            </span>
                          </div>
                          {tx.reference && tx.reference !== tx.id && (
                            <div className="text-[9px] text-slate-500 mt-1 truncate max-w-[120px] float-right">
                              Ref: {tx.reference}
                            </div>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}