import { Loader2 } from "lucide-react";

export function NovaLoader({ label = "Loading NovaVest Capital..." }: { label?: string }) {
  return (
    <div className="flex min-h-[55vh] items-center justify-center p-6">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 text-center shadow-[0_0_80px_rgba(45,212,191,.14)] backdrop-blur-2xl">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent" />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-teal-300/30 bg-teal-300/10 shadow-[0_0_50px_rgba(45,212,191,.22)]">
          <Loader2 className="h-8 w-8 animate-spin text-teal-200" />
        </div>
        <p className="mt-5 text-lg font-black tracking-tight text-white">{label}</p>
        <p className="mt-2 text-sm text-slate-400">Securing session, syncing portfolio data, and preparing your dashboard.</p>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-[nova-progress_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-400" />
        </div>
      </div>
    </div>
  );
}
