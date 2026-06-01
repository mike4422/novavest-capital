"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AnnouncementComposer() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    setLoading(false);
    toast.info("Announcement composer is ready. Connect this to /api/admin/announcements when you want live publishing.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4">
      <Input name="title" placeholder="Title" disabled={loading} />
      <Textarea name="message" placeholder="Announcement message" disabled={loading} />
      <Button loading={loading} loadingText="Publishing..." variant="premium">Publish</Button>
    </form>
  );
}
