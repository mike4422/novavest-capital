"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search, Gift, AlertTriangle } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

export default function AddBonusPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Fetch users for the dropdown
  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase.from("profiles").select("id, email, full_name, balance").order("created_at", { ascending: false }).limit(50);
      if (data) setUsers(data);
    }
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()) || u.full_name.toLowerCase().includes(search.toLowerCase()));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedUser) return toast.error("Please select a user first.");
    
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      userId: selectedUser.id,
      amount: formData.get("amount"),
      type: formData.get("type"), // BONUS or PENALTY
      description: formData.get("description")
    };

    try {
      const res = await fetch("/api/admin/add-bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
      // Update local state to reflect new balance visually
      setSelectedUser({...selectedUser, balance: selectedUser.balance + (payload.type === 'BONUS' ? Number(payload.amount) : -Number(payload.amount))});
      e.currentTarget.reset();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AdminHeader title="Add Bonus / Penalty" subtitle="Manually credit or debit user accounts." />
      
      <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Select User */}
        <Card className="glass-card p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Search className="h-5 w-5 text-teal-400"/> Step 1: Select User</h2>
          <Input 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />
          <div className="max-h-[400px] overflow-y-auto space-y-2 custom-scrollbar">
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
          </div>
        </Card>

        {/* Right Side: Apply Action */}
        <Card className="glass-card p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Gift className="h-5 w-5 text-violet-400"/> Step 2: Apply Funds</h2>
          
          {!selectedUser ? (
            <div className="h-[300px] flex items-center justify-center text-slate-500 border border-dashed border-white/10 rounded-xl">
              Select a user from the list to continue
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5 mb-6">
                <p className="text-xs text-slate-400">Target Account:</p>
                <p className="text-lg font-bold text-white">{selectedUser.full_name} <span className="text-sm font-normal text-slate-400">({selectedUser.email})</span></p>
                <p className="text-sm mt-1">Current Balance: <span className="text-teal-400 font-mono font-bold">{formatCurrency(selectedUser.balance)}</span></p>
              </div>

              <div className="space-y-2">
                <Label>Action Type</Label>
                <Select name="type" defaultValue="BONUS">
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BONUS">Add Bonus (Credit)</SelectItem>
                    <SelectItem value="PENALTY">Apply Penalty (Debit)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount (USD)</Label>
                <Input name="amount" type="number" step="0.01" min="0.01" required placeholder="e.g. 50.00" />
              </div>

              <div className="space-y-2">
                <Label>Description / Reason</Label>
                <Input name="description" required placeholder="e.g. Promo Campaign Reward" />
                <p className="text-[10px] text-slate-500">The user will see this message in their transaction history.</p>
              </div>

              <Button type="submit" variant="premium" className="w-full mt-4" loading={loading}>
                Process Transaction
              </Button>
            </form>
          )}
        </Card>
      </div>
    </>
  );
}