"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const links = [
  { href: "#plans", label: "Plans" },
  { href: "#features", label: "Security" },
  { href: "#transactions", label: "Live Activity" },
  { href: "#faq", label: "FAQ" }
];

export function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl">
      <div className="page-shell flex h-20 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-slate-300 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <Link href="/login"><Button variant="outline">Login</Button></Link>
          <Link href="/register"><Button variant="premium">Start Investing</Button></Link>
        </div>
        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Open menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="page-shell pb-5 lg:hidden">
          <div className="glass-card grid gap-3 rounded-3xl p-4">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-2xl px-4 py-3 text-slate-200 hover:bg-white/10" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link href="/login"><Button variant="outline" className="w-full">Login</Button></Link>
              <Link href="/register"><Button className="w-full">Start</Button></Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
