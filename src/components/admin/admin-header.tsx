import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AdminHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="border-b border-white/10 px-4 py-6 md:px-8">
      <Badge variant="violet" className="mb-3"><ShieldCheck className="mr-2 h-3 w-3" /> Admin Access</Badge>
      <h1 className="text-3xl font-black tracking-tight md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
    </header>
  );
}
