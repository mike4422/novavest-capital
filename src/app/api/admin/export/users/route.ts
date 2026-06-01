import { assertAdminFromRequest } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  await assertAdminFromRequest();
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("id,full_name,email,balance,status,referral_code,created_at").order("created_at", { ascending: false });
  const header = ["id", "full_name", "email", "balance", "status", "referral_code", "created_at"];
  const rows = (data || []).map((row: any) => header.map((key) => JSON.stringify(row[key] ?? "")).join(","));
  const csv = [header.join(","), ...rows].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=novavest-users.csv"
    }
  });
}
