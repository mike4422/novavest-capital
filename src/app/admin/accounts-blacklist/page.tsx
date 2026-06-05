"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ShieldAlert, Search, UserX, UserCheck, AlertTriangle } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

export default function AccountsBlacklistPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  
  // State for the blacklist table
  const [blacklistedUsers, setBlacklistedUsers] = useState<any[]>([]);
  const [fetchingBlacklist, setFetchingBlacklist] = useState(true);

  // State for the Search/Add to Blacklist tool
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banReason, setBanReason] = useState("");

  useEffect(() => {
    fetchBlacklist();
    fetchAllActiveUsers();
  }, [supabase]);

  async function fetchBlacklist() {
    setFetchingBlacklist(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, balance, created_at")
      .eq("status", "SUSPENDED")
      .order("updated_at", { ascending: false });
    
    if (data) setBlacklistedUsers(data);
    setFetchingBlacklist(false);
  }

  async function fetchAllActiveUsers() {
    // Fetch active users so the admin can search and ban them
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, balance")
      .neq("status", "SUSPENDED")
      .limit(100); // Limit to prevent massive payload, rely on search narrowing
      
    if (data) setAllUsers(data);
  }

  const filteredActiveUsers = allUsers.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleStatusChange(userId: string, action: "BAN" | "UNBAN", reason?: string) {
    if (action === "BAN" && !confirm("Are you sure you want to suspend this user? They will not be able to log in or withdraw funds.")) return;
    if (action === "UNBAN" && !confirm("Are you sure you want to restore this user's access?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, reason }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
      
      // Reset form and refresh lists
      setSelectedUser(null);
      setSearch("");
      setBanReason("");
      fetchBlacklist();
      fetchAllActiveUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AdminHeader title="Accounts Blacklist" subtitle="Manage suspended accounts and restrict access for fraudulent users." />
      
      <div className="p-4 md:p-8 grid grid-cols-1 xl:grid-cols-[350px_1fr] gap-8">
        
        {/* Left Column: Add to Blacklist */}
        <div className="space-y-6">
          <Card className="glass-card p-6 border-rose-500/20">
            <h2 className="font-bold flex items-center gap-2 mb-4 text-rose-400">
              <UserX className="h-5 w-5" /> Add to Blacklist
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Search Active User</Label>
                <Input 
                  placeholder="Name or email..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {search && !selectedUser && (
                <div className="max-h-[250px] overflow-y-auto space-y-2 custom-scrollbar">
                  {filteredActiveUsers.map(user => (
                    <div 
                      key={user.id} 
                      onClick={() => setSelectedUser(user)}
                      className="p-3 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer text-sm"
                    >
                      <div className="font-bold text-white">{user.full_name}</div>
                      <div className="text-xs text-slate-400 mt-1">{user.email}</div>
                    </div>
                  ))}
                  {filteredActiveUsers.length === 0 && <p className="text-xs text-slate-500 p-2">No active users found.</p>}
                </div>
              )}

              {selectedUser && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-4 animate-in fade-in">
                  <div>
                    <p className="text-xs text-rose-200/60 uppercase font-bold tracking-wider mb-1">Target Account</p>
                    <p className="font-bold text-white text-lg">{selectedUser.full_name}</p>
                    <p className="text-sm text-slate-300">{selectedUser.email}</p>
                    <p className="text-xs font-mono text-teal-400 mt-2">Balance: {formatCurrency(selectedUser.balance)}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-rose-200">Reason for suspension (Internal)</Label>
                    <Input 
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      placeholder="e.g. Fraudulent deposit proof"
                      className="bg-slate-950/50 border-rose-500/30 focus-visible:ring-rose-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      loading={loading}
                      onClick={() => handleStatusChange(selectedUser.id, "BAN", banReason)}
                    >
                      Suspend User
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedUser(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Currently Blacklisted */}
        <Card className="glass-card flex flex-col">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <h2 className="font-bold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-400" /> Currently Suspended
            </h2>
            <Badge variant="secondary" className="bg-slate-950">{blacklistedUsers.length} Users</Badge>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase text-slate-400">
                <tr>
                  <th className="p-4 border-b border-white/10">Investor Details</th>
                  <th className="p-4 border-b border-white/10">Balance Held</th>
                  <th className="p-4 border-b border-white/10">Joined Date</th>
                  <th className="p-4 border-b border-white/10 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {fetchingBlacklist ? (
                  <tr><td colSpan={4} className="p-12 text-center text-slate-500">Loading blacklist...</td></tr>
                ) : blacklistedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center">
                      <AlertTriangle className="h-8 w-8 text-slate-500 mx-auto mb-3 opacity-50" />
                      <p className="text-slate-400 text-lg">The blacklist is completely empty.</p>
                      <p className="text-slate-500 text-sm mt-1">No suspended users found in the database.</p>
                    </td>
                  </tr>
                ) : (
                  blacklistedUsers.map((user: any) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          {user.full_name}
                          <Badge variant="destructive" className="text-[10px] h-5">SUSPENDED</Badge>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{user.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-300">
                          {formatCurrency(user.balance)}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                          onClick={() => handleStatusChange(user.id, "UNBAN")}
                          disabled={loading}
                        >
                          <UserCheck className="h-4 w-4 mr-2" /> Revoke Ban
                        </Button>
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