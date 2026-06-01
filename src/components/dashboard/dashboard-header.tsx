import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DashboardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex flex-col gap-4 border-b border-white/10 px-4 py-5 md:px-8 lg:flex-row lg:items-center lg:justify-between">
      <div className="pl-12 lg:pl-0">
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
          <Input placeholder="Search transactions, plans..." className="w-72 pl-11" />
        </div>
        <Button variant="outline" size="icon"><Bell className="h-4 w-4" /></Button>
      </div>
    </header>
  );
}
