import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[20rem_1fr]">
      <AdminSidebar />
      <section className="min-w-0">{children}</section>
    </main>
  );
}
