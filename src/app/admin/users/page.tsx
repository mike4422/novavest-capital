import { AdminHeader } from "@/components/admin/admin-header";
import { BalanceEditor } from "@/components/admin/balance-editor";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export default async function AdminUsersPage() {
  const { supabase } = await requireAdmin();
  
  // Complex query to get user data + aggregate deposits, withdrawals, and upline in one go
  const { data: users } = await supabase
    .from("profiles")
    .select(`
      *,
      referrer:referred_by(full_name),
      deposits(amount, status),
      withdrawals(amount, status)
    `)
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminHeader title="Manage Users" subtitle="Search, view uplines, balances, and total funded amounts." />
      
      <div className="p-4 md:p-8">
        <Card className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase text-slate-400">
                <tr>
                  <th className="p-4 border-b border-white/10 w-2/5">User Info</th>
                  <th className="p-4 border-b border-white/10 w-2/5">Financials</th>
                  <th className="p-4 border-b border-white/10 w-1/5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(users || []).map((user: any) => {
                  // Calculate totals based on APPROVED status
                  const totalFunded = user.deposits?.filter((d: any) => d.status === 'APPROVED').reduce((sum: number, d: any) => sum + Number(d.amount), 0) || 0;
                  const totalWithdrawn = user.withdrawals?.filter((w: any) => w.status === 'APPROVED').reduce((sum: number, w: any) => sum + Number(w.amount), 0) || 0;
                  
                  return (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      {/* Left Column: User Data */}
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-base text-white">{user.full_name}</span>
                          <Badge variant={user.status === "ACTIVE" ? "success" : "warning"} className="text-[10px] h-5">{user.status}</Badge>
                        </div>
                        <div className="text-slate-400 space-y-1 text-xs">
                          <p><span className="text-slate-500">Email:</span> {user.email}</p>
                          <p><span className="text-slate-500">Since:</span> {new Date(user.created_at).toLocaleDateString()}</p>
                          <p><span className="text-slate-500">Upline:</span> {user.referrer?.full_name || 'None'}</p>
                        </div>
                      </td>

                      {/* Middle Column: Financials */}
                      <td className="p-4 align-top">
                        <div className="grid grid-cols-[100px_1fr] gap-1 text-xs">
                          <span className="text-slate-500">Balance:</span>
                          <span className="font-bold text-white">{formatCurrency(user.balance)}</span>
                          
                          <span className="text-slate-500">Funded:</span>
                          <span className="text-teal-400 font-medium">{formatCurrency(totalFunded)}</span>
                          
                          <span className="text-slate-500">Withdraw:</span>
                          <span className="text-rose-400 font-medium">{formatCurrency(totalWithdrawn)}</span>
                          
                          <span className="text-slate-500">Commission:</span>
                          <span className="text-violet-400 font-medium">{formatCurrency(user.referral_earnings)}</span>
                        </div>
                      </td>

                      {/* Right Column: Actions */}
                      <td className="p-4 align-top text-right space-y-2">
                        <div className="flex flex-col items-end gap-2">
                          {/* Note: In a real environment, wrap these in your dialog components */}
                          <Button size="sm" variant="outline" className="w-24 h-8 text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
                            EDIT
                          </Button>
                          <div className="w-24">
                            <BalanceEditor userId={user.id} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}