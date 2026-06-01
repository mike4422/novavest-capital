"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouteLoading } from "@/components/ui/loading/route-loading-provider";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startRouteLoading, stopRouteLoading } = useRouteLoading();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lastEmail, setLastEmail] = useState(searchParams.get("email") || "");
  const [needsConfirmation, setNeedsConfirmation] = useState(searchParams.get("confirm") === "1");

  useEffect(() => {
    const verification = searchParams.get("verification");
    if (searchParams.get("confirm") === "1") {
      toast.info("Please confirm your email before logging in.");
    }
    if (verification === "success") toast.success("Email confirmed successfully. You can now login.");
    if (verification === "expired") toast.error("Confirmation link expired. Request a new confirmation email.");
    if (verification === "invalid" || verification === "missing") toast.error("Invalid confirmation link.");
    if (verification === "used") toast.info("This confirmation link has already been used. You can login.");
    if (verification === "failed") toast.error("Could not confirm email. Request a new confirmation email.");
    if (searchParams.get("suspended") === "1") toast.error("Your account has been suspended. Contact support.");
  }, [searchParams]);

  async function resendConfirmation(emailOverride?: string) {
    const email = (emailOverride || lastEmail).toLowerCase().trim();

    if (!email) {
      toast.error("Enter your email address first.");
      return;
    }

    try {
      setResending(true);
      const res = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const json = await res.json();

      if (!res.ok) toast.error(json.error || "Could not resend confirmation email.");
      else toast.success(json.message || "Confirmation email sent.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let navigated = false;

    try {
      setLoading(true);
      const supabase = createClient();
      const email = String(formData.get("email") || "").toLowerCase().trim();
      const password = String(formData.get("password") || "");
      setLastEmail(email);

      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setNeedsConfirmation(true);
          toast.error("Please confirm your email before logging in.");
          return;
        }
        toast.error(error.message || "Unable to login.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email_verified_at, status")
        .eq("email", email)
        .single();

      if (profileError || !profile?.email_verified_at) {
        await supabase.auth.signOut();
        setNeedsConfirmation(true);
        toast.error("Please confirm your email before logging in.");
        return;
      }

      if (profile.status === "SUSPENDED") {
        await supabase.auth.signOut();
        toast.error("Your account has been suspended. Contact support.");
        return;
      }

      toast.success("Welcome back to NovaVest Capital.");
      startRouteLoading("Opening your investment dashboard...");
      navigated = true;
      router.push(searchParams.get("next") || "/dashboard");
      router.refresh();
    } catch {
      toast.error("Login failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
      if (!navigated) stopRouteLoading();
    }
  }

  return (
    <Card className="glass-card w-full max-w-md p-6">
      <div className="mb-8">
        <p className="text-3xl font-black tracking-tight">Welcome back</p>
        <p className="mt-2 text-sm text-slate-400">Login to access your investment dashboard.</p>
      </div>
      {needsConfirmation && (
        <div className="mb-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-semibold">Email confirmation required</p>
          <p className="mt-1 text-amber-100/80">Check your inbox for the NovaVest Capital confirmation link.</p>
          <button type="button" disabled={resending} onClick={() => resendConfirmation()} className="mt-3 font-semibold text-teal-200 hover:text-teal-100 disabled:cursor-wait disabled:opacity-70">
            {resending ? "Sending..." : "Resend confirmation email"}
          </button>
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label>Email address</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
            <Input name="email" type="email" required defaultValue={lastEmail} onChange={(event) => setLastEmail(event.target.value)} placeholder="you@example.com" className="pl-12" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
            <Input name="password" type={showPassword ? "text" : "password"} required placeholder="••••••••" className="pl-12 pr-12" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-3.5 text-slate-500">
              <Eye className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="text-teal-300 hover:text-teal-200">Forgot password?</Link>
          <Link href="/register" className="text-slate-400 hover:text-white">Create account</Link>
        </div>
        <Button loading={loading} loadingText="Signing in..." className="w-full" variant="premium">Login</Button>
      </form>
    </Card>
  );
}
