import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    
    // Fetch the processings/gateways configuration
    const { data, error } = await admin.from("settings").select("value").eq("key", "payment_gateways").single();
    
    // If it doesn't exist yet, return a default empty structure
    if (error || !data) {
      return NextResponse.json({ 
        ok: true, 
        gateways: {
          manual: { enabled: true },
          nowpayments: { enabled: false, apiKey: "", ipnSecret: "" },
          coinpayments: { enabled: false, merchantId: "", ipnSecret: "" }
        } 
      });
    }
    
    return NextResponse.json({ ok: true, gateways: data.value });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch processings." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const gateways = await request.json(); 

    if (!gateways) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    // Upsert the gateway configurations into the settings table
    const { error } = await admin.from("settings").upsert({
      key: "payment_gateways",
      value: gateways,
      updated_at: new Date().toISOString()
    }, { onConflict: "key" });
      
    if (error) throw error;

    // Log the administrative action for security audits
    await admin.from("activity_logs").insert({
      action: "PAYMENT_PROCESSINGS_UPDATED",
      metadata: { gateways_updated: Object.keys(gateways) }
    });

    return NextResponse.json({ ok: true, message: "Payment processings saved successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save processings." }, { status: 500 });
  }
}