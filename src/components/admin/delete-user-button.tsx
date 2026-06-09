"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeleteUserButton({ userId, userName }: { userId: string, userName: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    // Strict warning to prevent accidental clicks
    if (!confirm(`Are you absolutely sure you want to permanently delete ${userName}?\n\nThis will destroy their profile, active investments, and transaction history. This action CANNOT be undone.`)) {
      return;
    }

    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success("User deleted successfully.");
      router.refresh(); // Magically refreshes the server component table behind it!
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Button 
      size="sm" 
      variant="outline" 
      onClick={handleDelete}
      disabled={deleting}
      className="w-24 h-8 text-xs bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
    >
      {deleting ? "REMOVING..." : "REMOVE"}
    </Button>
  );
}