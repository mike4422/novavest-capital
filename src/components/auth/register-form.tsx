"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouteLoading } from "@/components/ui/loading/route-loading-provider";

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { startRouteLoading, stopRouteLoading } = useRouteLoading();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let navigated = false;

    try {
      setLoading(true);
      const email = String(formData.get("email") || "").toLowerCase().trim();
      const payload = {
        fullName: String(formData.get("fullName") || "").trim(),
        email,
        password: String(formData.get("password") || ""),
        referralCode: String(formData.get("referralCode") || params.get("ref") || "").trim(),
        selectedPlan: params.get("plan")
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Registration failed.");
        return;
      }

      toast.success("Account created. Please check your email to confirm your account.");
      startRouteLoading("Preparing confirmation page...");
      navigated = true;
      router.push(`/login?confirm=1&email=${encodeURIComponent(email)}`);
    } catch {
      toast.error("Registration failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
      if (!navigated) stopRouteLoading();
    }
  }

  return (
    <Card className="glass-card w-full max-w-md p-6">
      <div className="mb-8">
        <p className="text-3xl font-black tracking-tight">Create your account</p>
        <p className="mt-2 text-sm text-slate-400">Start your secure NovaVest investment journey.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label>Full name</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
            <Input name="fullName" required placeholder="John Carter" className="pl-12" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Email address</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
            <Input name="email" type="email" required placeholder="you@example.com" className="pl-12" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
            <Input name="password" type="password" minLength={8} required placeholder="Minimum 8 characters" className="pl-12" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Referral code (optional)</Label>
          <Input name="referralCode" defaultValue={params.get("ref") || ""} placeholder="NOVAXXXXXX" />
        </div>
        <Button loading={loading} loadingText="Creating account..." className="w-full" variant="premium">Create Account</Button>
        <p className="text-center text-sm text-slate-400">Already registered? <Link href="/login" className="text-teal-300">Login</Link></p>
      </form>
    </Card>
  );
}
