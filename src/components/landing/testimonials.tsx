import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const testimonials = [
  { name: "Sophia Bennett", country: "United Kingdom", profit: "$12,450", quote: "The dashboard feels like a private banking terminal. Deposits and investment tracking are extremely clear." },
  { name: "Daniel Okafor", country: "Nigeria", profit: "$4,880", quote: "NovaVest gave me a clean overview of my active plans, referral income, and withdrawals without confusion." },
  { name: "Mia Rodriguez", country: "Spain", profit: "$21,900", quote: "The admin-reviewed flow and notifications made every step feel professional and transparent." }
];

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="page-shell">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="mb-4">Investor stories</Badge>
          <h2 className="text-4xl font-black tracking-tight md:text-6xl">Trusted by modern crypto investors</h2>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <Card key={item.name} className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-300 to-violet-400 text-lg font-black text-slate-950">
                  {item.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.country}</p>
                </div>
              </div>
              <p className="mt-6 text-sm leading-7 text-slate-300">“{item.quote}”</p>
              <div className="mt-6 rounded-2xl bg-white/5 p-4">
                <p className="text-xs text-slate-500">Profit earned</p>
                <p className="text-2xl font-black text-teal-200">{item.profit}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
