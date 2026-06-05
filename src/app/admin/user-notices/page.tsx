"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Bell, Send, Users, User, MessageSquare, Clock, Search, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

export default function UserNoticesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form State
  const [target, setTarget] = useState("ALL");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");

  // User Search State (for specific targeting)
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // History State
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
    fetchUsers();
  }, [supabase]);

  async function fetchHistory() {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/user-notices");
      const json = await res.json();
      if (json.ok && json.notices) {
        setHistory(json.notices);
      }
    } catch (err) {
      toast.error("Failed to load notice history.");
    } finally {
      setFetching(false);
    }
  }

  async function fetchUsers() {
    const { data } = await supabase.from("profiles").select("id, email, full_name").limit(100);
    if (data) setUsers(data);
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (target === "SPECIFIC" && !selectedUser) {
      return toast.error("Please select a specific user first.");
    }

    if (target === "ALL" && !confirm("You are about to blast this notification to EVERY registered user. Are you sure?")) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/user-notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target,
          userId: selectedUser?.id || null,
          title,
          message,
          type
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
      setTitle("");
      setMessage("");
      setSelectedUser(null);
      setSearchQuery("");
      fetchHistory(); // Refresh the log
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const getTypeIcon = (noticeType: string) => {
    switch (noticeType) {
      case 'success': return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      default: return <Info className="h-4 w-4 text-sky-400" />;
    }
  };

  return (
    <>
      <AdminHeader 
        title="User Notices" 
        subtitle="Send direct dashboard notifications to specific accounts or broadcast to the entire platform." 
      />
      
      <div className="p-4 md:p-8 grid grid-cols-1 xl:grid-cols-[450px_1fr] gap-8">
        
        {/* Left Column: Compose Notice */}
        <Card className="glass-card p-6 border-sky-500/20 h-fit">
          <h2 className="font-bold flex items-center gap-2 mb-6 text-sky-400">
            <Send className="h-5 w-5" /> Compose Notice
          </h2>
          
          <form onSubmit={handleSend} className="space-y-5">
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger className={target === "ALL" ? "border-amber-500/50 text-amber-300 bg-amber-500/10" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">
                    <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Broadcast to All Users</span>
                  </SelectItem>
                  <SelectItem value="SPECIFIC">
                    <span className="flex items-center gap-2"><User className="h-4 w-4" /> Send to Specific User</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {target === "SPECIFIC" && (
              <div className="space-y-2 p-4 border border-white/10 rounded-xl bg-slate-950/50 animate-in fade-in">
                <Label>Search User</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input 
                    placeholder="Search name or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {searchQuery && !selectedUser && (
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
                  <div className="flex justify-between items-center p-3 mt-2 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sm">
                    <div>
                      <span className="font-bold text-sky-100 block">{selectedUser.full_name}</span>
                      <span className="text-xs text-sky-300">{selectedUser.email}</span>
                    </div>
                    <button type="button" onClick={() => setSelectedUser(null)} className="text-xs text-rose-400 hover:text-rose-300">Change</button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-white/10">
              <Label>Notice Title</Label>
              <Input 
                placeholder="e.g. Action Required: Invalid Wallet" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Message Body</Label>
              <Textarea 
                placeholder="Type your message here..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px] resize-y"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Alert Type (Icon/Color)</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Information (Blue)</SelectItem>
                  <SelectItem value="success">Success (Green)</SelectItem>
                  <SelectItem value="warning">Warning / Alert (Yellow)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" variant="premium" className="w-full" loading={loading}>
              <Send className="h-4 w-4 mr-2" /> Dispatch Notice
            </Button>
          </form>
        </Card>

        {/* Right Column: Dispatch History */}
        <Card className="glass-card flex flex-col">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <h2 className="font-bold flex items-center gap-2 text-slate-300">
              <Bell className="h-5 w-5" /> Dispatch History
            </h2>
          </div>
          
          <div className="overflow-x-auto flex-1 p-0">
            {fetching ? (
              <div className="p-12 text-center text-slate-500">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="h-8 w-8 text-slate-500 mx-auto mb-3 opacity-50" />
                <p className="text-slate-400 text-lg">No notices sent yet.</p>
                <p className="text-slate-500 text-sm mt-1">Dispatched notifications will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {history.map((notice: any) => (
                  <div key={notice.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <div className="mt-1 bg-slate-900 p-2 rounded-full border border-white/5">
                          {getTypeIcon(notice.type)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-200">{notice.title}</h4>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{notice.message}</p>
                          <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-500 font-mono">
                            <Clock className="h-3 w-3" />
                            {new Date(notice.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        {notice.user_id ? (
                          <Badge variant="secondary" className="bg-sky-500/10 text-sky-400 border-sky-500/20 text-[10px]">
                            Private Msg
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                            Broadcast
                          </Badge>
                        )}
                        {notice.profiles && (
                          <div className="text-[10px] text-slate-500 mt-2 truncate max-w-[120px]">
                            To: {notice.profiles.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

      </div>
    </>
  );
}