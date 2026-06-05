"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Send, Users, Search, AlertCircle } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

export default function SendNewsletterPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [audience, setAudience] = useState("all");
  
  // Specific User Search State
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form State
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // Fetch users if they select "specific"
  useEffect(() => {
    if (audience === "specific" && users.length === 0) {
      async function fetchUsers() {
        const { data } = await supabase.from("profiles").select("id, email, full_name").order("created_at", { ascending: false }).limit(100);
        if (data) setUsers(data);
      }
      fetchUsers();
    }
  }, [audience, users.length, supabase]);

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (audience === "specific" && !selectedUser) {
      return toast.error("Please select a specific user.");
    }
    
    // Quick confirmation to prevent accidental mass emails
    if (audience === "all" || audience === "active") {
      if (!confirm(`Are you absolutely sure you want to broadcast this email to ALL ${audience} users?`)) return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience,
          userId: selectedUser?.id,
          subject,
          body
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
      setSubject("");
      setBody("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AdminHeader title="Send Newsletter" subtitle="Broadcast updates, promos, or security notices directly to investor inboxes." />
      
      <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
        
        {/* Left Sidebar: Audience Selection */}
        <div className="space-y-6">
          <Card className="glass-card p-6">
            <h2 className="font-bold flex items-center gap-2 mb-4"><Users className="h-5 w-5 text-teal-400" /> 1. Select Audience</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Target Group</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger><SelectValue placeholder="Select audience" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Registered Users</SelectItem>
                    <SelectItem value="active">Active Users Only</SelectItem>
                    <SelectItem value="specific">Specific User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {audience === "all" && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3 text-amber-200/80 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>This will send to every single user in your database. Use this sparingly to avoid being flagged as spam.</p>
                </div>
              )}

              {audience === "specific" && (
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <Input 
                    placeholder="Search name or email..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar pr-2">
                    {filteredUsers.map(user => (
                      <div 
                        key={user.id} 
                        onClick={() => setSelectedUser(user)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors text-sm ${selectedUser?.id === user.id ? 'border-teal-500 bg-teal-500/10' : 'border-white/10 hover:bg-white/5'}`}
                      >
                        <div className="font-bold text-white">{user.full_name}</div>
                        <div className="text-xs text-slate-400 mt-1">{user.email}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Area: Message Composer */}
        <Card className="glass-card p-6">
          <h2 className="font-bold flex items-center gap-2 mb-6"><Send className="h-5 w-5 text-violet-400" /> 2. Compose Message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Email Subject</Label>
              <Input 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                required 
                placeholder="e.g. Important Update: New VIP Investment Plans Available!" 
                className="text-lg font-semibold"
              />
            </div>

            <div className="space-y-2">
              <Label>Message Body</Label>
              <Textarea 
                value={body} 
                onChange={(e) => setBody(e.target.value)} 
                required 
                className="min-h-[350px] bg-slate-950/50 resize-y leading-relaxed"
                placeholder="Type your message here. Line breaks will be automatically converted to HTML paragraphs in the final email..."
              />
            </div>

            <Button type="submit" variant="premium" className="w-full" loading={loading}>
              <Send className="h-4 w-4 mr-2" /> 
              {audience === "specific" ? "Send to Selected User" : "Broadcast Newsletter"}
            </Button>
          </form>
        </Card>

      </div>
    </>
  );
}