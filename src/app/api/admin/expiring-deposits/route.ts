import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    
    // Fetch all ACTIVE investments, sorted by the expiration date (closest first)
    const { data, error } = await admin
      .from("investments")
      .select(`
        id, 
        amount, 
        plan_name, 
        status, 
        created_at, 
        expires_at, 
        user_id,
        profiles (full_name, email)
      `)
      .eq("status", "ACTIVE")
      .order("expires_at", { ascending: true })
      .limit(100);
      
    if (error) {
      // Graceful fallback if the table structure differs
      if (error.code === '42P01') {
         return NextResponse.json({ ok: true, deposits: [], warning: "Investments table missing." });
      }
      throw error;
    }
    
    return NextResponse.json({ ok: true, deposits: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch expiring deposits." }, { status: 500 });
  }
}