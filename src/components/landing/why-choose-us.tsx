"use client";

import { motion } from "framer-motion";
import { Bot, Globe2, Headphones, LockKeyhole, RefreshCcw, ShieldCheck, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  { title: "Fast withdrawals", desc: "Reviewed withdrawals with transparent status updates and email alerts.", icon: RefreshCcw },
  { title: "Encrypted security", desc: "Supabase Auth, RLS policies, audit logs, and server-only admin keys.", icon: LockKeyhole },
  { title: "Professional asset management", desc: "Plan-based allocation tracking with lifecycle states and profit history.", icon: TrendingUp },
  { title: "24/7 support", desc: "Notification center, email templates, and AI support widget structure.", icon: Headphones },
  { title: "Real-time analytics", desc: "Dashboard cards, portfolio charts, and admin intelligence panels.", icon: ShieldCheck },
  { title: "Global access", desc: "Responsive interface designed for investors on mobile, tablet, and desktop.", icon: Globe2 },
  { title: "AI-powered systems", desc: "Built to present advanced automation, market intelligence, and portfolio monitoring.", icon: Bot }
];

export function WhyChooseUs() {
  return (
    <section id="features" className="py-24">
      <div className="page-shell">
        <div className="max-w-3xl">
          <Badge className="mb-4">Why choose us</Badge>
          <h2 className="text-4xl font-black tracking-tight md:text-6xl">Designed for trust, scale, and investor confidence</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }}>
              <Card className="glass-card h-full p-6">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-300/10 text-teal-300">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{feature.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
