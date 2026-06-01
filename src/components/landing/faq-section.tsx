import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const faqs = [
  ["How do I invest?", "Create an account, deposit supported crypto, select a plan, and confirm your investment from the dashboard."],
  ["When do I receive profits?", "Profit timing follows the selected plan duration and is credited after completion review or automated cron processing."],
  ["How long do withdrawals take?", "Withdrawals enter pending review and are approved or rejected by the admin with email status updates."],
  ["Which cryptocurrencies are supported?", "USDT TRC20, USDT BEP20, USDT ERC20, Ethereum, and Bitcoin are supported in the default schema."],
  ["Is my investment secure?", "The starter uses Supabase Auth, RLS, admin roles, audit logs, and server-side service-role operations for protected workflows."],
  ["Do I need verification?", "KYC upload and review sections are included so verification can be required based on your compliance policy."],
  ["What is the minimum deposit?", "The default minimum starts at $100, and admins can change network deposit limits from wallet management." ]
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24">
      <div className="page-shell grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
        <div>
          <Badge className="mb-4">FAQ</Badge>
          <h2 className="text-4xl font-black tracking-tight md:text-6xl">Common investor questions</h2>
        </div>
        <div className="grid gap-4">
          {faqs.map(([q, a]) => (
            <Card key={q} className="glass-card p-6">
              <h3 className="text-lg font-bold">{q}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-400">{a}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
