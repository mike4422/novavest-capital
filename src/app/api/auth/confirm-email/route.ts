import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { emails } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { getSiteUrl, hashEmailToken } from "@/lib/auth/email-verification";

function redirectWithStatus(status: string) {
  return NextResponse.redirect(`${getSiteUrl()}/login?verification=${encodeURIComponent(status)}`);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) return redirectWithStatus("missing");

  try {
    const admin = createAdminClient();
    const tokenHash = hashEmailToken(token);

    const { data: record, error } = await admin
      .from("email_verification_tokens")
      .select("id, user_id, email, expires_at, used_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (error || !record) return redirectWithStatus("invalid");
    if (record.used_at) return redirectWithStatus("used");
    if (new Date(record.expires_at).getTime() < Date.now()) return redirectWithStatus("expired");

    const { error: authError } = await admin.auth.admin.updateUserById(record.user_id, {
      email_confirm: true
    });

    if (authError) return redirectWithStatus("failed");

    const verifiedAt = new Date().toISOString();

    const { data: profile } = await admin
      .from("profiles")
      .update({ email_verified_at: verifiedAt })
      .eq("id", record.user_id)
      .select("full_name, email")
      .single();

    await admin
      .from("email_verification_tokens")
      .update({ used_at: verifiedAt })
      .eq("id", record.id);

    await admin.from("notifications").insert({
      user_id: record.user_id,
      title: "Email confirmed",
      message: "Your NovaVest Capital account is now active.",
      type: "SECURITY"
    });

    await admin.from("activity_logs").insert({
      actor_id: record.user_id,
      action: "EMAIL_CONFIRMED",
      metadata: { email: record.email }
    });

    if (profile?.email) {
      await sendEmail({
        to: profile.email,
        subject: "Your NovaVest Capital email is confirmed",
        html: emails.emailConfirmed(profile.full_name || "Investor")
      });
    }

    return redirectWithStatus("success");
  } catch {
    return redirectWithStatus("failed");
  }
}
