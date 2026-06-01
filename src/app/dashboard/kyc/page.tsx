import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KycUploadForm } from "@/components/dashboard/kyc-upload-form";
import { Card } from "@/components/ui/card";

export default function KYCPage() {
  return (
    <>
      <DashboardHeader title="KYC Verification" subtitle="Upload identity documents for compliance review." />
      <div className="p-4 md:p-8">
        <Card className="glass-card max-w-2xl p-6">
          <p className="text-2xl font-black">Verification upload</p>
          <p className="mt-2 text-sm text-slate-400">This UI is ready to connect to your preferred KYC provider or Supabase Storage bucket.</p>
          <KycUploadForm />
        </Card>
      </div>
    </>
  );
}
