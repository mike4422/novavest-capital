import { AnnouncementComposer } from "@/components/admin/announcement-composer";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";

export default async function AdminAnnouncementsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });

  return (
    <>
      <AdminHeader title="Announcements" subtitle="Publish platform-wide investor messages and banners." />
      <div className="grid gap-6 p-4 md:p-8 xl:grid-cols-[.75fr_1.25fr]">
        <Card className="glass-card p-6">
          <p className="text-xl font-bold">Create announcement</p>
          <AnnouncementComposer />
        </Card>
        <Card className="glass-card p-6">
          <p className="text-xl font-bold">Recent announcements</p>
          <div className="mt-5 grid gap-3">
            {(data || []).map((a: any) => (
              <div key={a.id} className="rounded-2xl border border-white/10 p-4">
                <p className="font-semibold">{a.title}</p>
                <p className="mt-1 text-sm text-slate-400">{a.message}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
