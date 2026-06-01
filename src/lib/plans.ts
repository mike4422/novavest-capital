export type InvestmentPlan = {
  slug: string;
  name: string;
  min: number;
  max: number;
  invest: number;
  returnAmount: number;
  profit: number;
  durationHours: number;
  risk: "Conservative" | "Balanced" | "Growth" | "Advanced" | "VIP";
  gradient: string;
  description: string;
};

export const investmentPlans: InvestmentPlan[] = [
  {
    slug: "starter",
    name: "Starter Plan",
    invest: 100,
    min: 100,
    max: 199,
    returnAmount: 125,
    profit: 25,
    durationHours: 24,
    risk: "Conservative",
    gradient: "from-teal-400/20 via-cyan-500/10 to-slate-950",
    description: "Entry plan for first-time users testing the NovaVest engine."
  },
  {
    slug: "silver",
    name: "Silver Plan",
    invest: 200,
    min: 200,
    max: 499,
    returnAmount: 250,
    profit: 50,
    durationHours: 24,
    risk: "Balanced",
    gradient: "from-slate-300/20 via-blue-500/10 to-slate-950",
    description: "Short-duration allocation designed for steady growth cycles."
  },
  {
    slug: "bronze",
    name: "Bronze Plan",
    invest: 500,
    min: 500,
    max: 999,
    returnAmount: 650,
    profit: 150,
    durationHours: 48,
    risk: "Growth",
    gradient: "from-orange-400/20 via-amber-500/10 to-slate-950",
    description: "Multi-day strategy with improved capital efficiency."
  },
  {
    slug: "platinum",
    name: "Platinum Plan",
    invest: 1000,
    min: 1000,
    max: 4999,
    returnAmount: 1400,
    profit: 400,
    durationHours: 72,
    risk: "Advanced",
    gradient: "from-violet-400/20 via-fuchsia-500/10 to-slate-950",
    description: "Premium strategy built for larger portfolio exposure."
  },
  {
    slug: "diamond-vip",
    name: "Diamond VIP Plan",
    invest: 5000,
    min: 5000,
    max: 19999,
    returnAmount: 9500,
    profit: 4500,
    durationHours: 120,
    risk: "VIP",
    gradient: "from-sky-300/20 via-indigo-500/10 to-slate-950",
    description: "VIP wealth strategy with extended compounding window."
  },
  {
    slug: "gold-vip",
    name: "Gold VIP Plan",
    invest: 20000,
    min: 20000,
    max: 1000000,
    returnAmount: 45500,
    profit: 25500,
    durationHours: 168,
    risk: "VIP",
    gradient: "from-yellow-300/20 via-amber-500/10 to-slate-950",
    description: "Institutional-grade private allocation for top-tier investors."
  }
];

export function roiPercent(plan: Pick<InvestmentPlan, "profit" | "invest">) {
  return (plan.profit / plan.invest) * 100;
}

export function getPlan(slug: string) {
  return investmentPlans.find((plan) => plan.slug === slug);
}
