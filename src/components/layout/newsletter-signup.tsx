"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSignup() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 550));
    setLoading(false);
    toast.success("Thanks. Newsletter API can be connected when you are ready.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 flex gap-3">
      <Input name="email" placeholder="Email address" type="email" disabled={loading} />
      <Button loading={loading} loadingText="Subscribing...">Subscribe</Button>
    </form>
  );
}
