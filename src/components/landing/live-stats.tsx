"use client";

import { motion } from "framer-motion";
import { Activity, ArrowDownLeft, ArrowUpRight, DollarSign, Radio, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const stats = [
  { label: "Total Investors", value: "48,290", icon: Users },
  { label: "Total Deposits", value: "$92.4M", icon: ArrowDownLeft },
  { label: "Total Withdrawals", value: "$61.8M", icon: ArrowUpRight },
  { label: "Running Investments", value: "12,840", icon: Activity },
  { label: "Active Users Online", value: "2,911", icon: Radio },
  { label: "Total Profit Paid", value: "$18.7M", icon: DollarSign }
];

export function LiveStats() {
  return (
    <section className="py-12">
      <div className="page-shell grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }}>
            <Card className="glass-card p-5">
              <stat.icon className="h-5 w-5 text-teal-300" />
              <p className="mt-5 text-2xl font-black tracking-tight">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
