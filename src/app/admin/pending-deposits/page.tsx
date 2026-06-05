"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, ExternalLink, Hash, Image as ImageIcon } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

export default function PendingDepositsPage() {
  const supabase = createClient();
  const [requests, setRequests] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingDeposits();
  }, [supabase]);

  async function fetchPendingDeposits() {
    setFetching(true);
    // Fetch deposits that need admin review, including the user's profile data
    const { data } = await supabase
      .from("deposits")
      .select("*, profiles(full_name, email)")
      .eq("status", "PENDING_REVIEW")
      .order("created_at", { ascending: true }); // Oldest first
    
    if (data) setRequests(data);
    setFetching(false);
  }

  async function handleAction(id: string, action: "approve" | "reject") {
    if (action === "approve" && !confirm("Have you verified this transaction on the blockchain/bank? Click OK to approve and credit the user's balance.")) return;
    if (action === "reject" && !confirm("Are you sure you want to reject this deposit? The user will not be credited.")) return;

    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/deposits/${id}/${action}`, {
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

  return (
    <>
      <AdminHeader 
        title="Pending Deposits" 
        subtitle="Verify inbound transactions, check payment proofs, and credit user accounts." 
      />
      
      <div className="p-4 md:p-8">
        <Card className="glass-card flex flex-col">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <h2 className="font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" /> Awaiting Verification
            </h2>
            <Badge variant="warning" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
              {requests.length} Pending
            </Badge>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase text-slate-400">
                <tr>
                  <th className="p-4 border-b border-white/10">Date Submitted</th>
                  <th className="p-4 border-b border-white/10">Investor</th>
                  <th className="p-4 border-b border-white/10">Amount & Route</th>
                  <th className="p-4 border-b border-white/10">Verification Details</th>
                  <th className="p-4 border-b border-white/10 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr><td colSpan={5} className="p-12 text-center text-slate-500">Loading pending deposits...</td></tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <CheckCircle className="h-8 w-8 text-slate-500 mx-auto mb-3 opacity-50" />
                      <p className="text-slate-400 text-lg">All caught up!</p>
                      <p className="text-slate-500 text-sm mt-1">There are currently no pending deposits waiting for review.</p>
                    </td>
                  </tr>
                ) : (
                  requests.map((req: any) => (
                    <tr key={req.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      
                      {/* Date Submitted */}
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
                        <div className="font-mono font-bold text-base text-emerald-400">
                          {formatCurrency(req.amount)}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                            {req.asset}
                          </Badge>
                          <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                            {req.network}
                          </Badge>
                        </div>
                      </td>

                      {/* Verification / Proof */}
                      <td className="p-4 align-middle space-y-2">
                        {req.tx_hash ? (
                          <div className="flex items-center gap-2">
                            <Hash className="h-3.5 w-3.5 text-slate-500" />
                            <code className="bg-slate-950 px-2 py-1 rounded text-xs text-sky-300 font-mono border border-white/10 break-all max-w-[200px]">
                              {req.tx_hash}
                            </code>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">No TX Hash provided</span>
                        )}

                        {req.proof_url && (
                          <div>
                            <a 
                              href={req.proof_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors bg-violet-500/10 px-2 py-1 rounded-md"
                            >
                              <ImageIcon className="h-3 w-3" /> View Receipt <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
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
                            variant="secondary"
                            className="w-28 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
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