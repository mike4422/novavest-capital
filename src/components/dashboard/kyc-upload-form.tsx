"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function KycUploadForm() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setLoading(false);
    toast.info("KYC upload UI is ready. Connect this form to Supabase Storage when you want live document upload.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-5">
      <div><Label>Government ID</Label><Input type="file" accept="image/*,.pdf" disabled={loading} /></div>
      <div><Label>Proof of address</Label><Input type="file" accept="image/*,.pdf" disabled={loading} /></div>
      <Button loading={loading} loadingText="Submitting review..." variant="premium">Submit for review</Button>
    </form>
  );
}
