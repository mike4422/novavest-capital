"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      setLoading(true);
      const supabase = createClient();
      const email = String(formData.get("email") || "").toLowerCase().trim();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/update-password`
      });
      if (error) toast.error(error.message);
      else toast.success("Password reset email sent.");
    } catch {
      toast.error("Could not send password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="glass-card w-full max-w-md p-6">
      <h1 className="text-3xl font-black">Reset password</h1>
      <p className="mt-2 text-sm text-slate-400">Enter your email and we will send a secure reset link.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Label>Email address</Label>
        <Input name="email" type="email" required placeholder="you@example.com" disabled={loading} />
        <Button loading={loading} loadingText="Sending reset link..." className="w-full">Send reset link</Button>
      </form>
    </Card>
  );
}
