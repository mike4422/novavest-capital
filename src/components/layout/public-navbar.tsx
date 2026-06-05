"use client";

import Link from "next/link";
import { Menu, X, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "#plans", label: "Plans" },
  { href: "#features", label: "Security" },
  { href: "#transactions", label: "Live Activity" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact Us" }
];

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const [globalLinks, setGlobalLinks] = useState<any>({});
  const supabase = createClient();

  useEffect(() => {
    async function fetchLinks() {
      const { data } = await supabase.from("settings").select("value").eq("key", "links_replacement").single();
      if (data?.value) setGlobalLinks(data.value);
    }
    fetchLinks();
  }, [supabase]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl">
      <div className="page-shell flex h-20 items-center justify-between">
        <Logo />
        
        <nav className="hidden items-center gap-8 text-sm text-slate-300 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-white font-medium">
              {link.label}
            </Link>
          ))}
          {globalLinks.telegram && (
            <a href={globalLinks.telegram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium transition">
              <Send className="h-3.5 w-3.5" /> Community
            </a>
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <Link href="/login"><Button variant="outline">Login</Button></Link>
          <Link href="/register"><Button variant="premium">Start Investing</Button></Link>
        </div>
        
        <button className="lg:hidden p-2 text-slate-300" onClick={() => setOpen(!open)} aria-label="Open menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="page-shell pb-5 lg:hidden animate-in slide-in-from-top-2">
          <div className="glass-card grid gap-2 rounded-3xl p-4">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-xl px-4 py-3 text-slate-200 hover:bg-white/10 font-medium" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            
            {globalLinks.telegram && (
              <a href={globalLinks.telegram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl px-4 py-3 text-sky-400 hover:bg-sky-500/10 font-medium">
                <Send className="h-4 w-4" /> Join Telegram Community
              </a>
            )}

            <div className="grid grid-cols-2 gap-3 pt-4 mt-2 border-t border-white/10">
              <Link href="/login"><Button variant="outline" className="w-full">Login</Button></Link>
              <Link href="/register"><Button className="w-full bg-teal-500 hover:bg-teal-600 text-white">Start</Button></Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}