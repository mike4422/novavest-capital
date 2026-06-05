"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Network, Search, AlertTriangle, ShieldCheck, UserX, User } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function IPsCheckPage() {
  const [loading, setLoading] = useState(true);
  const [ipData, setIpData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchIpData();
  }, []);

  async function fetchIpData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ips-check");
      const json = await res.json();
      if (json.ok && json.data) {
        setIpData(json.data);
      }
    } catch (err) {
      toast.error("Failed to load IP tracking data.");
    } finally {
      setLoading(false);
    }
  }

  // Filter based on IP address or User Email
  const filteredData = ipData.filter(record => {
    const query = searchQuery.toLowerCase();
    const matchIp = record.ip.toLowerCase().includes(query);
    const matchUser = record.users.some((u: any) => u.email.toLowerCase().includes(query) || u.name.toLowerCase().includes(query));
    return matchIp || matchUser;
  });

  return (
    <>
      <AdminHeader 
        title="IPs Check & Fraud Detection" 
        subtitle="Monitor user network activity and catch duplicate accounts farming referral commissions." 
      />
      
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        
        {/* Statistics & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
          <div className="flex gap-4">
            <Card className="glass-card p-4 border-white/10 flex-1 flex items-center gap-4">
              <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400">
                <Network className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tracked IPs</p>
                <p className="text-2xl font-black">{ipData.length}</p>
              </div>
            </Card>
            
            <Card className="glass-card p-4 border-rose-500/20 flex-1 flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Duplicates</p>
                <p className="text-2xl font-black text-rose-400">
                  {ipData.filter(r => r.users.length > 1).length}
                </p>
              </div>
            </Card>
          </div>

          <Card className="glass-card p-4 border-white/10 flex flex-col justify-center">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Search IP or Email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-900 border-white/10"
              />
            </div>
          </Card>
        </div>

        {/* IP Ledger */}
        <Card className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-bold">IP Address</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Associated Accounts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                      Scanning network logs...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                      No IP records found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((record, index) => {
                    const isDuplicate = record.users.length > 1;
                    return (
                      <tr key={index} className={`hover:bg-white/[0.02] transition-colors ${isDuplicate ? 'bg-rose-500/[0.02]' : ''}`}>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 font-mono text-base">
                            {isDuplicate ? (
                              <AlertTriangle className="h-4 w-4 text-rose-400" />
                            ) : (
                              <Network className="h-4 w-4 text-slate-500" />
                            )}
                            <span className={isDuplicate ? "text-rose-100 font-bold" : "text-slate-300"}>
                              {record.ip}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {isDuplicate ? (
                            <Badge variant="destructive" className="bg-rose-500/10 text-rose-400 border-rose-500/20">
                              <UserX className="h-3 w-3 mr-1" /> Multi-Account Risk
                            </Badge>
                          ) : (
                            <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                              <ShieldCheck className="h-3 w-3 mr-1" /> Clean
                            </Badge>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            {record.users.map((user: any) => (
                              <div key={user.id} className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-lg border border-white/5">
                                <User className="h-4 w-4 text-slate-500 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-200 truncate">{user.name}</p>
                                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                </div>
                                <div className="shrink-0 text-right">
                                  <Badge variant="secondary" className="text-[9px] bg-slate-800 text-slate-300">
                                    {user.type}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
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