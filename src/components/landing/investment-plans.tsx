"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calculator, Clock, ShieldAlert, TrendingUp } from "lucide-react";
import { investmentPlans, roiPercent } from "@/lib/plans";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function InvestmentPlans() {
  return (
    <section id="plans" className="py-24">
      <div className="page-shell">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="mb-4">Investment plans</Badge>
          <h2 className="text-4xl font-black tracking-tight md:text-6xl">Premium crypto allocation strategies</h2>
          <p className="mt-5 text-slate-400">Choose a plan, fund your account, and track portfolio progress in real time from your secure dashboard.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {investmentPlans.map((plan, index) => (
            <motion.div key={plan.slug} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} whileHover={{ y: -8 }}>
              <Card className={`glass-card relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${plan.gradient} p-6`}>
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-teal-300/10 blur-3xl" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-2xl font-black">{plan.name}</p>
                      <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
                    </div>
                    <Badge variant={plan.risk === "VIP" ? "violet" : "default"}>{plan.risk}</Badge>
                  </div>
                  <div className="my-6 rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                    <p className="text-sm text-slate-400">Invest</p>
                    <p className="mt-2 text-4xl font-black">{formatCurrency(plan.invest)}</p>
                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl bg-white/5 p-3"><p className="text-slate-500">Return</p><p className="font-bold text-teal-200">{formatCurrency(plan.returnAmount)}</p></div>
                      <div className="rounded-2xl bg-white/5 p-3"><p className="text-slate-500">Profit</p><p className="font-bold text-violet-200">{formatCurrency(plan.profit)}</p></div>
                    </div>
                  </div>
                  <div className="grid gap-3 text-sm text-slate-300">
                    <div className="flex items-center justify-between"><span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-teal-300" /> ROI</span><b>{formatPercent(roiPercent(plan))}</b></div>
                    <div className="flex items-center justify-between"><span className="flex items-center gap-2"><Clock className="h-4 w-4 text-teal-300" /> Duration</span><b>{plan.durationHours / 24} Day{plan.durationHours > 24 ? "s" : ""}</b></div>
                    <div className="flex items-center justify-between"><span className="flex items-center gap-2"><Calculator className="h-4 w-4 text-teal-300" /> Min / Max</span><b>{formatCurrency(plan.min)} - {plan.max >= 1000000 ? "$1M+" : formatCurrency(plan.max)}</b></div>
                    <div className="flex items-center justify-between"><span className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-amber-300" /> Risk Badge</span><b>{plan.risk}</b></div>
                  </div>
                  <Link href={`/register?plan=${plan.slug}`}><Button className="mt-7 w-full" variant="premium">Invest Now</Button></Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
