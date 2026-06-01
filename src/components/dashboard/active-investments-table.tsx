import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, planProgress } from "@/lib/utils";

type ActiveInvestment = {
  id: string;
  plan_name: string;
  amount: number;
  expected_profit: number;
  start_date: string;
  end_date: string;
  status: string;
  roi_percent: number;
};

export function ActiveInvestmentsTable({ investments }: { investments: ActiveInvestment[] }) {
  return (
    <Card className="glass-card overflow-hidden">
      <div className="border-b border-white/10 p-6">
        <p className="text-xl font-bold">Live active investments</p>
        <p className="text-sm text-slate-400">Track each plan, ROI, progress, and maturity date.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr className="border-b border-white/10">
              <th className="p-4">Plan</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Profit</th>
              <th className="p-4">Start Date</th>
              <th className="p-4">End Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Progress</th>
              <th className="p-4">ROI %</th>
            </tr>
          </thead>
          <tbody>
            {investments.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-slate-400">No active investments yet. Choose a plan to begin.</td></tr>
            )}
            {investments.map((investment) => {
              const progress = planProgress(investment.start_date, investment.end_date);
              return (
                <tr key={investment.id} className="border-b border-white/5">
                  <td className="p-4 font-semibold">{investment.plan_name}</td>
                  <td className="p-4">{formatCurrency(investment.amount)}</td>
                  <td className="p-4 text-teal-300">{formatCurrency(investment.expected_profit)}</td>
                  <td className="p-4 text-slate-400">{new Date(investment.start_date).toLocaleString()}</td>
                  <td className="p-4 text-slate-400">{new Date(investment.end_date).toLocaleString()}</td>
                  <td className="p-4"><Badge variant="success">{investment.status}</Badge></td>
                  <td className="p-4"><Progress value={progress} /><span className="mt-1 block text-xs text-slate-500">{progress}%</span></td>
                  <td className="p-4 font-bold">{investment.roi_percent}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
