import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase.from("transactions").select("*").eq("id", id).eq("user_id", user.id).single();
  if (error || !data) return NextResponse.json({ error: "Receipt not found." }, { status: 404 });
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Receipt</title></head><body style="font-family:Arial;padding:40px;background:#f8fafc;color:#0f172a"><div style="max-width:720px;margin:auto;background:white;border-radius:24px;padding:32px;border:1px solid #e2e8f0"><h1>NovaVest Capital Receipt</h1><p><b>Transaction:</b> ${data.id}</p><p><b>Type:</b> ${data.type}</p><p><b>Amount:</b> ${formatCurrency(data.amount)} ${data.asset}</p><p><b>Status:</b> ${data.status}</p><p><b>Date:</b> ${new Date(data.created_at).toLocaleString()}</p><p><b>Reference:</b> ${data.reference || "N/A"}</p></div></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
