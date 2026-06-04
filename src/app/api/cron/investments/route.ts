import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { emails } from "@/lib/email/templates";

// Changed to GET: Vercel Cron Jobs execute as HTTP GET requests by default.
export async function GET(request: Request) {
  const auth = request.headers.get("authorization") || "";
  
  // Fixed missing backticks for template literal
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: matured, error } = await admin
    .from("investments")
    .select("*, profiles(full_name,email)")
    .eq("status", "ACTIVE")
    .lte("end_date", new Date().toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  let completedCount = 0;

  for (const investment of matured || []) {
    try {
      // 1. Update investment status
      const { error: updateError } = await admin
        .from("investments")
        .update({ status: "COMPLETED", completed_at: new Date().toISOString() })
        .eq("id", investment.id);
        
      if (updateError) throw new Error(`Status update failed: ${updateError.message}`);

      // 2. Increment user balance
      const { error: rpcError } = await admin.rpc("increment_user_balance", { 
        p_user_id: investment.user_id, 
        p_amount: investment.return_amount 
      });
      
      if (rpcError) throw new Error(`Balance increment failed: ${rpcError.message}`);

      // 3. Create transaction record
      await admin.from("transactions").insert({ 
        user_id: investment.user_id, 
        type: "PAYOUT", 
        amount: investment.return_amount, 
        asset: "USD", 
        status: "COMPLETED", 
        reference: investment.id 
      });

      // 4. Send notification (Fixed missing backticks here too)
      await admin.from("notifications").insert({ 
        user_id: investment.user_id, 
        title: "Investment completed", 
        message: `${investment.plan_name} completed and returns were credited.`, 
        type: "INVESTMENT" 
      });

      // 5. Send Email
      const profile = investment.profiles as any;
      if (profile?.email) {
        await sendEmail({ 
          to: profile.email, 
          subject: "Investment completed", 
          html: emails.investmentCompleted(
            profile.full_name || "Investor", 
            investment.plan_name, 
            Number(investment.return_amount)
          ) 
        });
      }

      completedCount++;
    } catch (err) {
      // Log the error but allow the loop to continue paying out other users
      console.error(`Error processing investment ${investment.id}:`, err);
    }
  }

  // Only log if we actually completed processing
  if (completedCount > 0) {
    await admin.from("activity_logs").insert({ 
      action: "CRON_INVESTMENTS_COMPLETED", 
      metadata: { count: completedCount } 
    });
  }

  return NextResponse.json({ ok: true, completed: completedCount });
}