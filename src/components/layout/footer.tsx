import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { NewsletterSignup } from "@/components/layout/newsletter-signup";

const links = ["Terms", "Privacy", "Risk Disclosure", "AML Policy", "Contact"];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/70 py-12">
      <div className="page-shell grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-6">
          <Logo />
          <p className="max-w-xl text-sm leading-7 text-slate-400">
            NovaVest Capital is a premium crypto wealth-management interface for secure deposits, transparent investment tracking, referral growth, and enterprise-grade administration.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2"><ShieldCheck className="h-4 w-4 text-teal-300" /> RLS Protected</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2"><Mail className="h-4 w-4 text-teal-300" /> support@novavestcapital.com</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2"><MapPin className="h-4 w-4 text-teal-300" /> Global Access</span>
          </div>
        </div>
        <div className="glass-card rounded-[2rem] p-6">
          <p className="text-lg font-semibold">Join the investor briefing</p>
          <p className="mt-2 text-sm text-slate-400">Get platform updates, portfolio insights, and security announcements.</p>
          <NewsletterSignup />
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-400 sm:grid-cols-5">
            {links.map((link) => (
              <Link key={link} href="#" className="flex items-center gap-1 hover:text-white">
                {link} <ArrowUpRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
