import type { Viewport } from "next";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/auth";

// Force a fixed desktop width for all /admin routes so admins can pinch-to-zoom on mobile
export const viewport: Viewport = {
  width: 1280,
  initialScale: undefined, 
  maximumScale: 5,
  userScalable: true,
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  
  return (
    // min-w-[1200px] forces the desktop layout structure even on mobile screens
    <main className="min-h-screen grid grid-cols-[18rem_1fr] min-w-[1200px] bg-slate-950 text-slate-50">
      <AdminSidebar />
      <section className="min-w-0">{children}</section>
    </main>
  );
}