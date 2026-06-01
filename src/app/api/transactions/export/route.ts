import { requireUser } from "@/lib/auth";

export async function GET() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const header = ["id", "type", "amount", "asset", "status", "reference", "created_at"];
  const rows = (data || []).map((row: any) => header.map((key) => JSON.stringify(row[key] ?? "")).join(","));
  const csv = [header.join(","), ...rows].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=novavest-transactions.csv"
    }
  });
}
