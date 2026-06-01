"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";

export function FeedbackButton({
  children,
  message = "This action is ready to connect to your backend API.",
  loadingText = "Processing...",
  onDone,
  ...props
}: ButtonProps & { message?: string; onDone?: () => void }) {
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    setLoading(false);
    toast.info(message);
    onDone?.();
  }

  return (
    <Button type="button" {...props} loading={loading} loadingText={loadingText} onClick={run}>
      {children}
    </Button>
  );
}
