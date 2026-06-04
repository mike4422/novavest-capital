"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Activity, BarChart3, BellRing, CircleDollarSign, Database, 
  Gauge, Landmark, MessageCircle, ShieldCheck, Users, 
  WalletCards, Menu, X 
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/admin", label: "Analytics", icon: Gauge },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/deposits", label: "Deposits", icon: CircleDollarSign },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: WalletCards },
  { href: "/admin/wallets", label: "Wallet Addresses", icon: Landmark },
  { href: "/admin/investments", label: "Investments", icon: BarChart3 },
  { href: "/admin/announcements", label: "Announcements", icon: BellRing },
  { href: "/admin/support", label: "Support Inbox", icon: MessageCircle },
  { href: "/admin/roles", label: "Admin Roles", icon: ShieldCheck },
  { href: "/admin/logs", label: "System Logs", icon: Database }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on mobile automatically when a user clicks a link and route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent background body scrolling when the mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // We wrap the inner contents so we don't have to duplicate the code for Desktop and Mobile
  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between px-2 py-3">
        <Logo />
        {/* Close button for mobile only */}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsOpen(false)}>
          <X className="h-5 w-5 text-slate-400" />
        </Button>
      </div>
      
      <div className="mt-6 rounded-[1.5rem] border border-violet-300/20 bg-violet-300/10 p-4">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-violet-200" />
          <div>
            <p className="text-sm font-semibold">Admin Control</p>
            <p className="text-xs text-slate-400">Enterprise operations</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6 grid gap-1 overflow-y-auto pb-24">
        {links.map((link) => (
          <Link 
            key={link.href} 
            href={link.href} 
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-400 hover:bg-white/10 hover:text-white transition-colors", 
              pathname === link.href && "bg-white/10 text-white"
            )}
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        ))}
      </nav>
      
      <Link href="/dashboard" className="absolute bottom-6 left-6 right-6 z-10 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-center text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
        Back to user dashboard
      </Link>
    </>
  );

  return (
    <>
      {/* 1. Mobile Top Header (Visible ONLY on small screens) */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Logo />
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <Menu className="h-6 w-6 text-slate-300" />
        </Button>
      </div>

      {/* 2. Mobile Sidebar Overlay (Slide-in) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)}>
          <aside 
            className="absolute bottom-0 left-0 top-0 w-[280px] border-r border-white/10 bg-slate-950 p-4 shadow-2xl animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()} // Prevents clicking the sidebar itself from closing the overlay
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* 3. Desktop Sidebar (Original behavior, hidden on mobile) */}
      <aside className="sticky top-0 hidden h-screen border-r border-white/10 bg-slate-950/95 p-4 lg:block">
        <SidebarContent />
      </aside>
    </>
  );
}