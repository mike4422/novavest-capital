"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Bitcoin, CandlestickChart, CheckCircle2, Coins, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const floating = [
  { icon: Bitcoin, label: "BTC", className: "left-[7%] top-28" },
  { icon: Coins, label: "USDT", className: "right-[10%] top-36" },
  { icon: CandlestickChart, label: "+24.8%", className: "right-[18%] bottom-20" }
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-24 pt-16 md:pt-24">
      {/* Background Image Added Here */}
      <Image 
        src="/background.png" /* Change this to your exact image filename (e.g., /background.png) */
        alt="NovaVest Capital Background"
        fill
        priority
        className="object-cover object-center -z-20 opacity-30" /* Adjust opacity as needed */
      />
      
      <div className="absolute inset-0 -z-10 fintech-grid opacity-70" />
      {floating.map((item, index) => (
        <motion.div
          key={item.label}
          className={`absolute hidden rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl md:block ${item.className}`}
          animate={{ y: [0, -18, 0], rotate: [0, index % 2 ? 4 : -4, 0] }}
          transition={{ duration: 5 + index, repeat: Infinity, ease: "easeInOut" }}
        >
          <item.icon className="h-6 w-6 text-teal-300" />
          <p className="mt-2 text-xs font-semibold">{item.label}</p>
        </motion.div>
      ))}
      <div className="page-shell grid items-center gap-12 lg:grid-cols-[1fr_.9fr]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Badge className="mb-6 gap-2"><Sparkles className="h-3.5 w-3.5" /> Institutional crypto wealth engine</Badge>
          <h1 className="max-w-5xl text-5xl font-black tracking-[-0.06em] text-white md:text-7xl lg:text-8xl">
            Secure Crypto Investments With Daily Returns
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
            Build passive crypto income through a secure, transparent wealth-management dashboard with reviewed deposits, live investment tracking, referral earnings, and premium portfolio analytics.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/register"><Button size="lg" variant="premium">Start Investing <ArrowRight className="h-5 w-5" /></Button></Link>
            <Link href="#plans"><Button size="lg" variant="outline">View Plans</Button></Link>
          </div>
          <div className="mt-9 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
            {["Encrypted account system", "Manual admin review", "Live activity alerts"].map((item) => (
              <div key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-300" /> {item}</div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.75, delay: 0.1 }}>
          <Card className="glass-card relative overflow-hidden rounded-[2rem] p-4">
            <div className="absolute inset-x-10 top-0 h-32 bg-teal-300/20 blur-3xl" />
            <div className="relative rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Portfolio</p>
                  <p className="text-4xl font-black tracking-tight">$284,912.44</p>
                </div>
                <Badge variant="success">+18.4% Live</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Balance", "$48,240", "text-teal-300"],
                  ["Active", "$92,000", "text-cyan-300"],
                  ["Profit", "$17,840", "text-violet-300"]
                ].map(([label, value, color]) => (
                  <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className={`mt-2 text-xl font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 h-48 rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(45,212,191,.22),transparent_55%)] p-4">
                <div className="flex h-full items-end gap-2">
                  {[34, 48, 38, 72, 61, 88, 76, 94, 86, 100, 92, 118].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-xl bg-gradient-to-t from-teal-300/20 to-teal-300" style={{ height: `${h}px` }} />
                  ))}
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between rounded-3xl border border-teal-300/20 bg-teal-300/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-teal-300 p-3 text-slate-950"><ShieldCheck className="h-5 w-5" /></div>
                  <div>
                    <p className="font-semibold">Admin-reviewed deposit</p>
                    <p className="text-xs text-slate-400">USDT TRC20 · Waiting confirmation</p>
                  </div>
                </div>
                <BarChart3 className="h-6 w-6 text-teal-300" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}