"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Network, Link2, Unlink, Search, Users } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

export default function ReferralNetworkPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  
  // Ledger State
  const [networkLog, setNetworkLog] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  // Form State
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [uplineInput, setUplineInput] = useState("");

  useEffect(() => {
    fetchNetwork();
    fetchUsers();
  }, [supabase]);

  async function fetchNetwork() {
    setFetching(true);
    // Fetch users who have an upline, including the upline's details
    const { data } = await supabase
      .from("profiles")
      .select(`
        id, full_name, email, created_at,
        upline:referred_by(id, full_name, email, referral_code)
      `)
      .not("referred_by", "is", null)
      .order("created_at", { ascending: false })
      .limit(50);
    
    if (data) setNetworkLog(data);
    setFetching(false);
  }

  async function fetchUsers() {
    const { data } = await supabase.from("profiles").select("id, email, full_name").limit(100);
    if (data) setUsers(data);
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleUpdate(action: "CONNECT" | "DISCONNECT") {
    if (!selectedUser) return toast.error("Please select a downline user first.");
    if (action === "CONNECT" && !uplineInput) return toast.error("Please enter the upline's email or code.");

    const confirmMsg = action === "CONNECT" 
      ? `Assign an upline to ${selectedUser.full_name}?`
      : `Disconnect ${selectedUser.full_name} from their current upline?`;

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          uplineIdentifier: uplineInput,
          action
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
      setUplineInput("");
      setSelectedUser(null);
      setSearch("");
      fetchNetwork(); // Refresh the ledger automatically
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AdminHeader 
        title="Referral Network" 
        subtitle="Manage affiliate connections and manually override upline assignments." 
      />
      
      <div className="p-4 md:p-8 grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8">
        
        {/* Left Column: Manual Upline Assignment */}
        <div className="space-y-6">
          <Card className="glass-card p-6 border-violet-500/20">
            <h2 className="font-bold flex items-center gap-2 mb-6 text-violet-400">
              <Link2 className="h-5 w-5" /> Manage Connections
            </h2>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>1. Select Target User (Downline)</Label>
                <Input 
                  placeholder="Search name or email..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && !selectedUser && (
                  <div className="max-h-[150px] overflow-y-auto space-y-1 custom-scrollbar mt-2 border border-white/10 rounded-lg p-1 bg-slate-950">
                    {filteredUsers.map(user => (
                      <div 
                        key={user.id} 
                        onClick={() => setSelectedUser(user)}
                        className="p-2 rounded hover:bg-white/10 cursor-pointer text-xs"
                      >
                        <span className="font-bold text-white">{user.full_name}</span> - <span className="text-slate-400">{user.email}</span>
                      </div>
                    ))}
                  </div>
                )}
                {selectedUser && (
                  <div className="flex justify-between items-center p-3 mt-2 bg-violet-500/10 border border-violet-500/20 rounded-lg text-sm">
                    <div>
                      <span className="font-bold text-violet-100 block">{selectedUser.full_name}</span>
                      <span className="text-xs text-violet-300">{selectedUser.email}</span>
                    </div>
                    <button type="button" onClick={() => setSelectedUser(null)} className="text-xs text-rose-400 hover:text-rose-300">Clear</button>
                  </div>
                )}
              </div>

              {selectedUser && (
                <div className="space-y-4 pt-4 border-t border-white/10 animate-in fade-in">
                  <div className="space-y-2">
                    <Label>2. Assign New Upline</Label>
                    <Input 
                      placeholder="Upline's Email or Referral Code" 
                      value={uplineInput}
                      onChange={(e) => setUplineInput(e.target.value)}
                    />
                    <p className="text-[10px] text-slate-500">Enter the exact email or referral code of the person who invited them.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button 
                      variant="premium" 
                      loading={loading}
                      onClick={() => handleUpdate("CONNECT")}
                    >
                      <Link2 className="h-4 w-4 mr-2" /> Connect
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                      disabled={loading}
                      onClick={() => handleUpdate("DISCONNECT")}
                    >
                      <Unlink className="h-4 w-4 mr-2" /> Disconnect
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Network Ledger */}
        <Card className="glass-card flex flex-col">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <h2 className="font-bold flex items-center gap-2">
              <Network className="h-5 w-5 text-teal-400" /> Recent Affiliate Signups
            </h2>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase text-slate-400">
                <tr>
                  <th className="p-4 border-b border-white/10">Date Joined</th>
                  <th className="p-4 border-b border-white/10">New Investor (Downline)</th>
                  <th className="p-4 border-b border-white/10">Referred By (Upline)</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr><td colSpan={3} className="p-12 text-center text-slate-500">Loading network data...</td></tr>
                ) : networkLog.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-12 text-center">
                      <Users className="h-8 w-8 text-slate-500 mx-auto mb-3 opacity-50" />
                      <p className="text-slate-400 text-lg">No affiliate connections yet.</p>
                      <p className="text-slate-500 text-sm mt-1">When users sign up with a referral code, they will appear here.</p>
                    </td>
                  </tr>
                ) : (
                  networkLog.map((user: any) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4 align-middle text-slate-400 text-xs">
                        <div className="font-medium text-slate-300">{new Date(user.created_at).toLocaleDateString()}</div>
                        <div>{new Date(user.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white">{user.full_name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{user.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link2 className="h-4 w-4 text-violet-400 shrink-0" />
                          <div>
                            <div className="font-bold text-violet-100">{user.upline?.full_name || "Unknown"}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Code: {user.upline?.referral_code}</div>
                          </div>
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