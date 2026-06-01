"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, BellRing, CircleDollarSign, Database, Gauge, Landmark, ShieldCheck, Users, WalletCards } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Analytics", icon: Gauge },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/deposits", label: "Deposits", icon: CircleDollarSign },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: WalletCards },
  { href: "/admin/wallets", label: "Wallet Addresses", icon: Landmark },
  { href: "/admin/investments", label: "Investments", icon: BarChart3 },
  { href: "/admin/announcements", label: "Announcements", icon: BellRing },
  { href: "/admin/roles", label: "Admin Roles", icon: ShieldCheck },
  { href: "/admin/logs", label: "System Logs", icon: Database }
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen border-r border-white/10 bg-slate-950/95 p-4 lg:block">
      <div className="px-2 py-3"><Logo /></div>
      <div className="mt-6 rounded-[1.5rem] border border-violet-300/20 bg-violet-300/10 p-4">
        <div className="flex items-center gap-3"><Activity className="h-5 w-5 text-violet-200" /><div><p className="text-sm font-semibold">Admin Control</p><p className="text-xs text-slate-400">Enterprise operations</p></div></div>
      </div>
      <nav className="mt-6 grid gap-1">
        {links.map((link) => <Link key={link.href} href={link.href} className={cn("flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-400 hover:bg-white/10 hover:text-white", pathname === link.href && "bg-white/10 text-white")}><link.icon className="h-5 w-5" />{link.label}</Link>)}
      </nav>
      <Link href="/dashboard" className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 px-4 py-3 text-center text-sm text-slate-300 hover:bg-white/10">Back to user dashboard</Link>
    </aside>
  );
}
