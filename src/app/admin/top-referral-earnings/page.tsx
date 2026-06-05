import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { Trophy, Medal, Users } from "lucide-react";

export default async function TopReferralEarningsPage() {
  const { supabase } = await requireAdmin();

  // Fetch the top 50 earners, ordered by referral_earnings descending.
  // We explicitly use the foreign key name to avoid Supabase relation ambiguity.
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      referral_code,
      referral_earnings,
      status,
      created_at,
      downlines:referrals!referrals_referrer_id_fkey(id)
    `)
    .order("referral_earnings", { ascending: false })
    .limit(50);

  const topEarners = data || [];

  return (
    <>
      <AdminHeader 
        title="Top Referral Earnings" 
        subtitle="Leaderboard of investors with the highest affiliate commissions and network sizes." 
      />
      
      <div className="p-4 md:p-8">
        <Card className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase text-slate-400">
                <tr>
                  <th className="p-4 border-b border-white/10 w-16 text-center">Rank</th>
                  <th className="p-4 border-b border-white/10">Investor</th>
                  <th className="p-4 border-b border-white/10">Referral Code</th>
                  <th className="p-4 border-b border-white/10 text-center">Total Downlines</th>
                  <th className="p-4 border-b border-white/10 text-right">Total Commission</th>
                </tr>
              </thead>
              <tbody>
                {topEarners.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400">
                      No referral earnings found yet.
                    </td>
                  </tr>
                ) : (
                  topEarners.map((user: any, index: number) => {
                    const rank = index + 1;
                    // Count the number of people they successfully referred
                    const downlineCount = user.downlines?.length || 0;
                    
                    return (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        
                        {/* Rank / Trophies */}
                        <td className="p-4 align-middle text-center font-bold">
                          {rank === 1 && <Trophy className="h-6 w-6 text-yellow-400 mx-auto drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />}
                          {rank === 2 && <Medal className="h-6 w-6 text-slate-300 mx-auto drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]" />}
                          {rank === 3 && <Medal className="h-6 w-6 text-amber-600 mx-auto drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]" />}
                          {rank > 3 && <span className="text-slate-500">#{rank}</span>}
                        </td>
                        
                        {/* Investor Info */}
                        <td className="p-4 align-middle">
                          <div className="font-bold text-white flex items-center gap-2">
                            {user.full_name}
                            {user.status !== "ACTIVE" && (
                              <Badge variant="warning" className="text-[10px] h-5 px-1.5">{user.status}</Badge>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{user.email}</div>
                        </td>

                        {/* Referral Code */}
                        <td className="p-4 align-middle">
                          <span className="font-mono text-xs bg-white/5 px-2.5 py-1 rounded border border-white/10 text-teal-300">
                            {user.referral_code}
                          </span>
                        </td>

                        {/* Total Downlines */}
                        <td className="p-4 align-middle text-center">
                          <div className="flex items-center justify-center gap-1.5 text-slate-300">
                            <Users className="h-4 w-4 text-slate-500" />
                            <span className="font-bold text-sm">{downlineCount}</span>
                          </div>
                        </td>

                        {/* Total Commission */}
                        <td className="p-4 align-middle text-right">
                          <span className="text-lg font-black text-violet-400 drop-shadow-[0_0_12px_rgba(167,139,250,0.2)]">
                            {formatCurrency(user.referral_earnings)}
                          </span>
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
