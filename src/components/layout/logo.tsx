import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-300 via-cyan-300 to-violet-400 text-lg font-black text-slate-950 shadow-[0_0_40px_rgba(45,212,191,.35)]">
        N
      </div>
      <div>
        <p className="text-base font-bold leading-none tracking-tight">NovaVest</p>
        <p className="text-xs uppercase tracking-[0.32em] text-teal-200/80">Capital</p>
      </div>
    </Link>
  );
}
