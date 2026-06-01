"use client";

import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, Gem } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const feed = [
  { type: "Deposit", user: "A. Miller", amount: "$2,500", coin: "USDT TRC20", icon: ArrowDownLeft, color: "text-teal-300" },
  { type: "Withdrawal", user: "Kenji S.", amount: "$9,800", coin: "BTC", icon: ArrowUpRight, color: "text-violet-300" },
  { type: "Investment", user: "Amara N.", amount: "$5,000", coin: "Diamond VIP", icon: Gem, color: "text-cyan-300" },
  { type: "Payout", user: "Lucas R.", amount: "$1,400", coin: "Platinum", icon: CircleDollarSign, color: "text-amber-300" },
  { type: "Deposit", user: "Fatima A.", amount: "$20,000", coin: "USDT ERC20", icon: ArrowDownLeft, color: "text-teal-300" }
];

export function LiveTransactions() {
  return (
    <section id="transactions" className="py-24">
      <div className="page-shell grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
        <div>
          <Badge className="mb-4">Live activity</Badge>
          <h2 className="text-4xl font-black tracking-tight md:text-6xl">Real-time transaction intelligence</h2>
          <p className="mt-5 text-slate-400">Display deposits, withdrawals, new investments, and payouts in a premium animated feed that builds trust and keeps the platform active.</p>
        </div>
        <Card className="glass-card overflow-hidden rounded-[2rem] p-3">
          <div className="neon-line mb-3" />
          <div className="grid gap-3">
            {feed.map((item, index) => (
              <motion.div key={`${item.type}-${index}`} className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-4" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity, delay: index * 0.35 }}>
                <div className="flex items-center gap-4">
                  <div className={`rounded-2xl bg-white/10 p-3 ${item.color}`}><item.icon className="h-5 w-5" /></div>
                  <div>
                    <p className="font-semibold">{item.type}</p>
                    <p className="text-xs text-slate-400">{item.user} · {item.coin}</p>
                  </div>
                </div>
                <p className="font-black">{item.amount}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
