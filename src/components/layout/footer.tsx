import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, ShieldCheck, Send, MessageCircle, AtSign, Users, Camera } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { NewsletterSignup } from "@/components/layout/newsletter-signup";
import { createClient } from "@/lib/supabase/server";

const defaultLinks = [
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
  { label: "Terms", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Risk Disclosure", href: "#" },
  { label: "AML Policy", href: "#" }
];

export async function Footer() {
  const supabase = await createClient();
  
  // Fetch the dynamic links from your settings table
  const { data } = await supabase.from("settings").select("value").eq("key", "links_replacement").single();
  const globalLinks = data?.value || {};

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
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2">
              <Mail className="h-4 w-4 text-teal-300" /> {globalLinks.supportEmail || "support@novavest-capitals.com"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2"><MapPin className="h-4 w-4 text-teal-300" /> Global Access</span>
          </div>

          {/* Dynamically render social icons if the admin has set them */}
          <div className="flex gap-4 pt-2">
            {globalLinks.telegram && (
              <a href={globalLinks.telegram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-sky-500/20 text-slate-400 hover:text-sky-400 rounded-full transition-colors">
                <Send className="h-5 w-5" />
              </a>
            )}
            {globalLinks.whatsapp && (
              <a href={globalLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-full transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
            )}
            {globalLinks.twitter && (
              <a href={globalLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-sky-400/20 text-slate-400 hover:text-sky-300 rounded-full transition-colors">
                <AtSign className="h-5 w-5" />
              </a>
            )}
            {globalLinks.facebook && (
              <a href={globalLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-500 rounded-full transition-colors">
                <Users className="h-5 w-5" />
              </a>
            )}
            {globalLinks.instagram && (
              <a href={globalLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-pink-500/20 text-slate-400 hover:text-pink-500 rounded-full transition-colors">
                <Camera className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6">
          <p className="text-lg font-semibold">Join the investor briefing</p>
          <p className="mt-2 text-sm text-slate-400">Get platform updates, portfolio insights, and security announcements.</p>
          <NewsletterSignup />
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-400 sm:grid-cols-3">
            {defaultLinks.map((link) => (
              <Link key={link.label} href={link.href} className="flex items-center gap-1 hover:text-white">
                {link.label} <ArrowUpRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}