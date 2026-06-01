import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createEmailVerificationToken } from "@/lib/auth/email-verification";
import { sendEmail } from "@/lib/email/send";
import { emails } from "@/lib/email/templates";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const normalizedEmail = String(email || "").toLowerCase().trim();

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: profile } = await admin
      .from("profiles")
      .select("id, full_name, email, email_verified_at")
      .eq("email", normalizedEmail)
      .maybeSingle();

    // Do not reveal whether an email exists.
    if (!profile) {
      return NextResponse.json({ ok: true, message: "If this email exists, a confirmation link has been sent." });
    }

    if (profile.email_verified_at) {
      return NextResponse.json({ ok: true, message: "This email is already confirmed. You can login." });
    }

    const verification = await createEmailVerificationToken({
      admin,
      userId: profile.id,
      email: profile.email
    });

    await sendEmail({
      to: profile.email,
      subject: "Confirm your NovaVest Capital account",
      html: emails.confirmEmail(profile.full_name || "Investor", verification.confirmationUrl)
    });

    return NextResponse.json({ ok: true, message: "Confirmation email sent. Please check your inbox." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Could not resend confirmation email." }, { status: 400 });
  }
}
