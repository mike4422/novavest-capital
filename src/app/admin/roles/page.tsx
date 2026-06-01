import { AdminRoleForm } from "@/components/admin/admin-role-form";
import { AdminHeader } from "@/components/admin/admin-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";

export default async function AdminRolesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("admin_roles").select("*").order("created_at", { ascending: false });

  return (
    <>
      <AdminHeader title="Admin Roles" subtitle="Assign or revoke admin privileges by email." />
      <div className="grid gap-6 p-4 md:p-8 xl:grid-cols-[.75fr_1.25fr]">
        <Card className="glass-card p-6">
          <p className="text-xl font-bold">Assign admin</p>
          <AdminRoleForm />
          <p className="mt-3 text-xs text-slate-500">Use the SQL seed or connect this form to /api/admin/roles.</p>
        </Card>
        <Card className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500"><tr className="border-b border-white/10"><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Active</th><th className="p-4">Date</th></tr></thead>
              <tbody>{(data || []).map((r: any) => <tr key={r.id} className="border-b border-white/5"><td className="p-4">{r.email}</td><td className="p-4">{r.role}</td><td className="p-4"><Badge variant={r.active ? "success" : "destructive"}>{String(r.active)}</Badge></td><td className="p-4 text-slate-400">{new Date(r.created_at).toLocaleString()}</td></tr>)}</tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
