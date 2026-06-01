"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";

const data = [
  { name: "Mon", value: 1200 },
  { name: "Tue", value: 2100 },
  { name: "Wed", value: 1800 },
  { name: "Thu", value: 3400 },
  { name: "Fri", value: 4200 },
  { name: "Sat", value: 5100 },
  { name: "Sun", value: 6800 }
];

export function PortfolioChart() {
  return (
    <Card className="glass-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xl font-bold">Portfolio growth</p>
          <p className="text-sm text-slate-400">Live 7-day investment performance</p>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="portfolio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5eead4" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#5eead4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,.12)", borderRadius: 16 }} />
            <Area type="monotone" dataKey="value" stroke="#5eead4" fillOpacity={1} fill="url(#portfolio)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
