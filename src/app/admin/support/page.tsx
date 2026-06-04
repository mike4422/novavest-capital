import { AdminHeader } from "@/components/admin/admin-header";
import { SupportInbox } from "@/components/admin/support/support-inbox";

export default function AdminSupportPage() {
  return (
    <>
      <AdminHeader title="Support Inbox" subtitle="Reply to Nova AI support messages directly from the admin dashboard." />
      <div className="p-4 md:p-8">
        <SupportInbox />
      </div>
    </>
  );
}
