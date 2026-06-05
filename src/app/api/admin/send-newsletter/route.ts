import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/email/send";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const { audience, userId, subject, body } = await request.json();

    if (!subject || !body) {
      return NextResponse.json({ error: "Subject and body are required." }, { status: 400 });
    }

    // 1. Determine who we are sending to
    let query = admin.from("profiles").select("email, full_name");
    
    if (audience === "specific") {
      if (!userId) return NextResponse.json({ error: "User ID is required." }, { status: 400 });
      query = query.eq("id", userId);
    } else if (audience === "active") {
      query = query.eq("status", "ACTIVE");
    }
    // If audience is "all", the query remains unfiltered

    const { data: users, error } = await query;
    if (error) throw error;
    if (!users || users.length === 0) {
      return NextResponse.json({ error: "No users found matching those criteria." }, { status: 404 });
    }

    // 2. Wrap the raw text in a clean, professional HTML shell
    const formatNewsletter = (content: string) => `
      <div style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif;color:#0f172a;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:white;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
              <tr><td style="padding:30px;border-bottom:1px solid #e2e8f0;background:#020617;">
                <h1 style="margin:0;font-size:24px;color:white;letter-spacing:-0.5px;">NovaVest Capital</h1>
              </td></tr>
              <tr><td style="padding:30px;font-size:16px;line-height:1.6;color:#334155;">
                ${content.replace(/\n/g, '<br/>')}
              </td></tr>
              <tr><td style="padding:20px 30px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;text-align:center;">
                You are receiving this automated communication from NovaVest Capital.<br/>
                Please do not reply directly to this email.
              </td></tr>
            </table>
          </td></tr>
        </table>
      </div>
    `;

    // 3. Dispatch the emails 
    // (Note: For massive databases, you would eventually want to use a queue like Ingest or AWS SQS, 
    // but a direct loop works perfectly for hundreds of users)
    let sentCount = 0;
    for (const user of users) {
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: subject,
          html: formatNewsletter(body)
        });
        sentCount++;
      }
    }

    // 4. Log the administrative action
    await admin.from("activity_logs").insert({ 
      action: "NEWSLETTER_SENT", 
      metadata: { audience, subject, count: sentCount } 
    });

    return NextResponse.json({ ok: true, message: `Newsletter sent successfully to ${sentCount} recipient(s).` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send newsletter." }, { status: 500 });
  }
}