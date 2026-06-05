"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const menuGroups = [
  {
    category: "Investments",
    links: [
      { href: "/admin", label: "Analytics Dashboard" }, // Brought back original
      { href: "/admin/investment-packages", label: "Investment Packages" },
      { href: "/admin/investments", label: "Active Investments" }, // Brought back original
      { href: "/admin/expiring-deposits", label: "Expiring Deposits" },
    ]
  },
  {
    category: "Users & Accounts",
    links: [
      { href: "/admin/users", label: "Users" },
      { href: "/admin/roles", label: "Admin Roles" }, // Brought back original
      { href: "/admin/top-referral-earnings", label: "Top Referral Earnings" },
      { href: "/admin/accounts-blacklist", label: "Accounts Blacklist" },
    ]
  },
  {
    category: "Transactions",
    links: [
      { href: "/admin/transactions", label: "Transactions" },
      { href: "/admin/withdrawal-requests", label: "Withdrawal Requests" },
      { href: "/admin/add-funds", label: "Add Funds" },
      { href: "/admin/deposits", label: "Deposits" },
      { href: "/admin/withdrawals", label: "Withdrawals" },
      { href: "/admin/exchange", label: "Exchange" },
      { href: "/admin/referral", label: "Referral" },
      { href: "/admin/earnings", label: "Earnings" },
      { href: "/admin/add-bonus", label: "Add Bonus" },
      { href: "/admin/pending-deposits", label: "Pending Deposits" },
    ]
  },
  {
    category: "Settings",
    links: [
      { href: "/admin/settings", label: "Settings" },
      { href: "/admin/wallets", label: "Wallet Addresses" }, // Brought back original
      { href: "/admin/processings", label: "Processings" },
      { href: "/admin/referral-settings", label: "Referral Settings" },
      { href: "/admin/auto-withdrawals-settings", label: "Auto-Withdrawals Settings" },
      // { href: "/admin/email-templates", label: "Email Templates" },
      { href: "/admin/exchange-rates", label: "Exchange Rates" },
      { href: "/admin/info-box-settings", label: "Info Box Settings" },
      { href: "/admin/earning-holidays", label: "Earning Holidays" },
      { href: "/admin/links-replacement", label: "Links Replacement" },
      { href: "/admin/security", label: "Security" },
    ]
  },
  {
    category: "Tools & Pages",
    links: [
      { href: "/admin/support", label: "Support Inbox" }, // Brought back original
      { href: "/admin/maintenance-page", label: "Maintenance Page" },
      { href: "/admin/tell-a-friend", label: "Tell A Friend" },
      { href: "/admin/user-notices", label: "User Notices" },
      { href: "/admin/news", label: "News" },
      { href: "/admin/send-a-newsletter", label: "Send a Newsletter" },
      { href: "/admin/custom-pages", label: "Custom Pages" },
      { href: "/admin/ips-check", label: "IPs Check" },
      { href: "/admin/logs", label: "System Logs" }, // Brought back original
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="sticky top-0 h-screen border-r border-white/10 bg-slate-950/95 flex flex-col">
      <div className="p-4 border-b border-white/10">
        <Logo />
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {menuGroups.map((group, i) => (
          <div key={i} className="mb-6">
            <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-teal-400">
              {group.category}
            </h3>
            <ul className="space-y-0.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className={cn(
                      "block rounded-md px-3 py-1.5 text-sm transition-colors",
                      pathname === link.href 
                        ? "bg-teal-500/20 text-teal-300 font-medium border-l-2 border-teal-400" 
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link href="/api/auth/logout" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10">
          <LogOut className="h-4 w-4" /> Logout
        </Link>
      </div>
    </aside>
  );
}