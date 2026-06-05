"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search, Banknote, PlusCircle } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

export default function AddFundsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Fetch users for the dropdown
  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name, balance")
        .order("created_at", { ascending: false })
        .limit(100);
      if (data) setUsers(data);
    }
    fetchUsers();
  }, [supabase]);

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedUser) return toast.error("Please select a user first.");
    
    const formData = new FormData(e.currentTarget);
    const amount = formData.get("amount");
    
    if (!confirm(`Are you sure you want to add $${amount} to ${selectedUser.full_name}'s account?`)) return;

    setLoading(true);
    const payload = {
      userId: selectedUser.id,
      amount,
      description: formData.get("description")
    };

    try {
      const res = await fetch("/api/admin/add-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
      
      // Instantly update the UI to reflect the new balance
      setSelectedUser({
        ...selectedUser, 
        balance: selectedUser.balance + Number(payload.amount)
      });
      
      e.currentTarget.reset();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AdminHeader 
        title="Add Funds" 
        subtitle="Manually credit a user's account balance. This bypasses standard deposit gateways." 
      />
      
      <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Select User */}
        <Card className="glass-card p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-teal-400" /> Step 1: Select User
          </h2>
          <Input 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />
          <div className="max-h-[400px] overflow-y-auto space-y-2 custom-scrollbar pr-2">
            {filteredUsers.map(user => (
              <div 
                key={user.id} 
                onClick={() => setSelectedUser(user)}
                className={`p-3 rounded-xl border cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'border-teal-500 bg-teal-500/10' : 'border-white/10 hover:bg-white/5'}`}
              >
                <div className="font-bold text-sm text-white">{user.full_name}</div>
                <div className="text-xs text-slate-400 flex justify-between mt-1">
                  <span>{user.email}</span>
                  <span className="text-teal-300 font-mono">Bal: {formatCurrency(user.balance)}</span>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center text-slate-500 text-sm py-4">No users found.</div>
            )}
          </div>
        </Card>

        {/* Right Side: Apply Funds */}
        <Card className="glass-card p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Banknote className="h-5 w-5 text-emerald-400" /> Step 2: Deposit Details
          </h2>
          
          {!selectedUser ? (
            <div className="h-[300px] flex items-center justify-center text-slate-500 border border-dashed border-white/10 rounded-xl">
              Select a user from the list to continue
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5 mb-6">
                <p className="text-xs text-slate-400">Target Account:</p>
                <p className="text-lg font-bold text-white">
                  {selectedUser.full_name} <span className="text-sm font-normal text-slate-400">({selectedUser.email})</span>
                </p>
                <p className="text-sm mt-1">
                  Current Balance: <span className="text-teal-400 font-mono font-bold">{formatCurrency(selectedUser.balance)}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label>Deposit Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-bold">$</span>
                  <Input name="amount" type="number" step="0.01" min="1" required placeholder="0.00" className="pl-8 text-lg font-mono" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Internal Note / Description</Label>
                <Input name="description" required placeholder="e.g. Manual wire transfer deposit" />
                <p className="text-[10px] text-slate-500 mt-1">
                  This description will appear on the user's transaction history ledger.
                </p>
              </div>

              <Button type="submit" className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white border-none" loading={loading}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Credit Account
              </Button>
            </form>
          )}
        </Card>
      </div>
    </>
  );
}