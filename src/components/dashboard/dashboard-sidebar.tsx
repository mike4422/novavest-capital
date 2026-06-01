"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BarChart3, Bell, CreditCard, Gauge, Landmark, LayoutDashboard, LogOut, Menu, Settings, ShieldCheck, Sparkles, UploadCloud, Users, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/use-app-store";
import { useRouteLoading } from "@/components/ui/loading/route-loading-provider";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/deposit", label: "Deposit", icon: UploadCloud },
  { href: "/dashboard/withdraw", label: "Withdraw", icon: Wallet },
  { href: "/dashboard/investments", label: "Investments", icon: BarChart3 },
  { href: "/dashboard/referrals", label: "Referrals", icon: Users },
  { href: "/dashboard/history", label: "History", icon: CreditCard },
  { href: "/dashboard/kyc", label: "KYC", icon: ShieldCheck },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export function DashboardSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { startRouteLoading } = useRouteLoading();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    startRouteLoading("Signing out securely...");
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <button className="fixed left-4 top-4 z-50 rounded-2xl border border-white/10 bg-slate-950/80 p-3 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
        <Menu className="h-5 w-5" />
      </button>
      <aside className={cn("fixed inset-y-0 left-0 z-50 w-80 transform border-r border-white/10 bg-slate-950/95 p-4 backdrop-blur-2xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between px-2 py-3">
          <Logo />
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X /></button>
        </div>
        <div className="mt-6 rounded-[1.5rem] border border-teal-300/20 bg-teal-300/10 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-teal-300 p-3 text-slate-950"><Sparkles className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-semibold">Investor Terminal</p>
              <p className="text-xs text-slate-400">Live wealth dashboard</p>
            </div>
          </div>
        </div>
        <nav className="mt-6 grid gap-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white", active && "bg-white/10 text-white")}>
                <item.icon className="h-5 w-5" /> {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link href="/admin" className="mt-3 flex items-center gap-3 rounded-2xl border border-violet-300/20 bg-violet-300/10 px-4 py-3 text-sm font-semibold text-violet-100">
              <Gauge className="h-5 w-5" /> Admin Dashboard
            </Link>
          )}
        </nav>
        <div className="mt-auto absolute bottom-4 left-4 right-4 grid gap-3">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 p-2">
            <span className="pl-2 text-xs text-slate-400">Theme</span><ThemeToggle />
          </div>
          <Button variant="outline" onClick={logout} loading={loggingOut} loadingText="Signing out..."><LogOut className="h-4 w-4" /> Logout</Button>
        </div>
      </aside>
    </>
  );
}
