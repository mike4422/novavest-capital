"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminRoleForm() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    setLoading(false);
    toast.info("Admin role form is ready. For now, add admins from Supabase SQL or connect this form to /api/admin/roles.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4">
      <Input name="email" type="email" placeholder="admin@example.com" disabled={loading} />
      <Button loading={loading} loadingText="Assigning..." variant="premium">Assign Role</Button>
    </form>
  );
}
