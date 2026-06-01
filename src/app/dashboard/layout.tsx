import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { isAdminEmail, requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser();
  const isAdmin = await isAdminEmail(user.email);

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[20rem_1fr]">
      <DashboardSidebar isAdmin={isAdmin} />
      <section className="min-w-0">{children}</section>
    </main>
  );
}
