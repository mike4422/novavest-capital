import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FeedbackButton } from "@/components/ui/feedback-button";
import { requireUser } from "@/lib/auth";

export default async function SettingsPage() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <>
      <DashboardHeader title="Account Settings" subtitle="Profile, security, notification, and wallet preferences." />
      <div className="grid gap-6 p-4 md:p-8 xl:grid-cols-2">
        <Card className="glass-card p-6">
          <p className="text-xl font-bold">Profile</p>
          <div className="mt-6 space-y-4">
            <div><Label>Full name</Label><Input defaultValue={profile?.full_name || ""} /></div>
            <div><Label>Email</Label><Input defaultValue={profile?.email || user.email || ""} disabled /></div>
            <FeedbackButton message="Profile update endpoint is ready to connect to Supabase." loadingText="Saving...">Save changes</FeedbackButton>
          </div>
        </Card>
        <Card className="glass-card p-6">
          <p className="text-xl font-bold">Security</p>
          <p className="mt-2 text-sm text-slate-400">Two-factor authentication, session/device management, and security alerts can be connected here.</p>
          <div className="mt-6 grid gap-3">
            <FeedbackButton variant="outline" message="2FA setup flow is ready to connect.">Enable 2FA</FeedbackButton>
            <FeedbackButton variant="outline" message="Session/device management panel is ready to connect.">View active sessions</FeedbackButton>
            <FeedbackButton variant="outline" message="Account history export is ready to connect.">Download account history</FeedbackButton>
          </div>
        </Card>
      </div>
    </>
  );
}
