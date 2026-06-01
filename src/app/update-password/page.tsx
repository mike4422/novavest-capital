"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouteLoading } from "@/components/ui/loading/route-loading-provider";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { startRouteLoading } = useRouteLoading();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      const password = String(formData.get("password") || "");
      setLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Password updated successfully.");
      startRouteLoading("Opening your dashboard...");
      router.push("/dashboard");
    } catch {
      toast.error("Could not update password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="glass-card w-full max-w-md p-6">
        <h1 className="text-3xl font-black">Update password</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Label>New password</Label>
          <Input name="password" type="password" minLength={8} required placeholder="Minimum 8 characters" disabled={loading} />
          <Button loading={loading} loadingText="Updating password..." className="w-full" variant="premium">Update password</Button>
        </form>
      </Card>
    </main>
  );
}
