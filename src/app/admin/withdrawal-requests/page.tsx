"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, Copy, ExternalLink, Wallet } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

export default function WithdrawalRequestsPage() {
  const supabase = createClient();
  const [requests, setRequests] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingRequests();
  }, [supabase]);

  async function fetchPendingRequests() {
    setFetching(true);
    const { data } = await supabase
      .from("withdrawals")
      .select("*, profiles(full_name, email)")
      .eq("status", "PENDING_REVIEW")
      .order("created_at", { ascending: true }); // Oldest first so no one waits too long
    
    if (data) setRequests(data);
    setFetching(false);
  }

  async function handleAction(id: string, action: "approve" | "reject") {
    if (action === "reject" && !confirm("Are you sure you want to reject this withdrawal? The funds will be returned to the user's balance.")) return;
    if (action === "approve" && !confirm("Have you sent the funds to the user's wallet? Click OK to approve and close this request.")) return;

    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/${action}`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
      
      // Remove the processed request from the screen immediately
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Wallet address copied to clipboard!");
  }

  return (
    <>
      <AdminHeader 
        title="Pending Withdrawals" 
        subtitle="Review, approve, or reject user payout requests." 
      />
      
      <div className="p-4 md:p-8">
        <Card className="glass-card flex flex-col">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <h2 className="font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" /> Action Required
            </h2>
            <Badge variant="warning" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
              {requests.length} Pending
            </Badge>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase text-slate-400">
                <tr>
                  <th className="p-4 border-b border-white/10">Request Date</th>
                  <th className="p-4 border-b border-white/10">Investor</th>
                  <th className="p-4 border-b border-white/10">Amount & Asset</th>
                  <th className="p-4 border-b border-white/10">Receiving Wallet</th>
                  <th className="p-4 border-b border-white/10 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr><td colSpan={5} className="p-12 text-center text-slate-500">Loading requests...</td></tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <Wallet className="h-8 w-8 text-slate-500 mx-auto mb-3 opacity-50" />
                      <p className="text-slate-400 text-lg">Inbox Zero!</p>
                      <p className="text-slate-500 text-sm mt-1">There are currently no pending withdrawal requests.</p>
                    </td>
                  </tr>
                ) : (
                  requests.map((req: any) => (
                    <tr key={req.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      
                      {/* Request Date */}
                      <td className="p-4 align-middle">
                        <div className="font-medium text-slate-300">
                          {new Date(req.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {new Date(req.created_at).toLocaleTimeString()}
                        </div>
                      </td>

                      {/* Investor */}
                      <td className="p-4 align-middle">
                        <div className="font-bold text-white">
                          {req.profiles?.full_name || "Unknown User"}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {req.profiles?.email || "No email"}
                        </div>
                      </td>

                      {/* Amount & Asset */}
                      <td className="p-4 align-middle">
                        <div className="font-mono font-bold text-base text-rose-400">
                          {formatCurrency(req.amount)}
                        </div>
                       <div className="flex items-center gap-1.5 mt-1">
  <Badge variant="secondary" className="text-[9px] h-4 px-1 border-white/20 text-slate-300">
    {req.asset}
  </Badge>
  <Badge variant="secondary" className="text-[9px] h-4 px-1 border-white/20 text-slate-300">
    {req.network}
  </Badge>
</div>
                      </td>

                      {/* Receiving Wallet */}
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <code className="bg-slate-950 px-2 py-1 rounded text-xs text-teal-300 font-mono border border-white/10 break-all max-w-[200px]">
                            {req.wallet_address}
                          </code>
                          <button 
                            onClick={() => copyToClipboard(req.wallet_address)}
                            className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors"
                            title="Copy Wallet Address"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 align-middle text-right space-y-2">
                        <div className="flex flex-col items-end gap-2">
                          <Button 
                            size="sm" 
                            className="w-28 bg-emerald-500 hover:bg-emerald-600 text-white border-none"
                            loading={processingId === req.id}
                            disabled={processingId !== null}
                            onClick={() => handleAction(req.id, "approve")}
                          >
                            {!processingId && <CheckCircle className="h-4 w-4 mr-1.5" />} Approve
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-28 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                            disabled={processingId !== null}
                            onClick={() => handleAction(req.id, "reject")}
                          >
                            <XCircle className="h-4 w-4 mr-1.5" /> Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}