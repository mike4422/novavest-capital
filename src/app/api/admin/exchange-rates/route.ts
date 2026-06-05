import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    
    // Fetch the exchange rates configuration
    const { data, error } = await admin.from("settings").select("value").eq("key", "exchange_rates").single();
    
    // If it doesn't exist yet, return a default structure
    if (error || !data) {
      return NextResponse.json({ 
        ok: true, 
        settings: {
          autoUpdate: false,
          feePercent: 2.0,
          rates: {
            BTC: 65000,
            ETH: 3500,
            USDT: 1,
            LTC: 80,
            SOL: 150
          }
        } 
      });
    }
    
    return NextResponse.json({ ok: true, settings: data.value });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch exchange rates." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const settings = await request.json(); 

    if (!settings || !settings.rates) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    // Upsert the exchange rates into the database
    const { error } = await admin.from("settings").upsert({
      key: "exchange_rates",
      value: settings,
      updated_at: new Date().toISOString()
    }, { onConflict: "key" });
      
    if (error) throw error;

    // Log the administrative action for security audits
    await admin.from("activity_logs").insert({
      action: "EXCHANGE_RATES_UPDATED",
      metadata: { autoUpdate: settings.autoUpdate, fee: settings.feePercent }
    });

    return NextResponse.json({ ok: true, message: "Exchange rates saved successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save exchange rates." }, { status: 500 });
  }
}