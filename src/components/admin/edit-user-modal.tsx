"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Edit, Save, X, ShieldCheck, ShieldAlert, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function EditUserModal({ user }: { user: any }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    email: user.email || "",
    balance: String(user.balance || 0),
    status: user.status || "ACTIVE",
    password: ""
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success("User updated successfully!");
      setIsOpen(false);
      router.refresh(); // Automatically refreshes the server table data behind it
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="w-24 h-8 text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
      >
        EDIT
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-left animate-in fade-in">
          <div className="bg-slate-950 w-full max-w-md p-6 border border-emerald-500/30 shadow-2xl rounded-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit className="h-5 w-5 text-emerald-400" /> Edit User Profile
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-rose-400">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} required />
              </div>
              
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>

              <div className="space-y-2">
                <Label className="text-emerald-400">Account Balance (USD)</Label>
                <Input type="number" step="0.01" value={formData.balance} onChange={(e) => setFormData({...formData, balance: e.target.value})} required />
              </div>

              <div className="space-y-2">
                <Label>Account Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE"><span className="flex items-center gap-2 text-emerald-400"><ShieldCheck className="h-4 w-4" /> Active</span></SelectItem>
                    <SelectItem value="PENDING_REVIEW"><span className="flex items-center gap-2 text-amber-400"><ShieldAlert className="h-4 w-4" /> Pending Review</span></SelectItem>
                    <SelectItem value="SUSPENDED"><span className="flex items-center gap-2 text-rose-400"><UserX className="h-4 w-4" /> Suspended</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <Label className="text-rose-400">Force Change Password</Label>
                <Input 
                  type="password" 
                  placeholder="Leave blank to keep current password" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
              </div>

              <Button type="submit" variant="premium" className="w-full mt-4" disabled={saving}>
                {saving ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}