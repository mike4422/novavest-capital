import { Logo } from "@/components/layout/logo";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 fintech-grid opacity-60" />
      <div className="page-shell flex min-h-screen flex-col py-6">
        <div className="flex items-center justify-between">
          <Logo />
          <Link href="/" className="text-sm text-slate-400 hover:text-white">Back to home</Link>
        </div>
        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1fr_.75fr]">
          <div className="hidden lg:block">
            <p className="max-w-3xl text-6xl font-black tracking-[-0.05em]">Institutional-grade crypto dashboard for modern investors.</p>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">Secure access, real-time tracking, professional admin controls, and premium financial workflows.</p>
          </div>
          <div className="flex justify-center lg:justify-end">{children}</div>
        </div>
      </div>
    </main>
  );
}
