import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateReferralCode } from "@/lib/utils";
import { registerSchema } from "@/lib/validators";
import { sendAdminEmail, sendEmail } from "@/lib/email/send";
import { emails } from "@/lib/email/templates";

export async function POST(request: Request) {
  try {
    const body = registerSchema.parse(await request.json());
    const admin = createAdminClient();

    const normalizedEmail = body.email.toLowerCase().trim();

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id, email_verified_at")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingProfile?.id) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    // Creating user and bypassing email confirmation
    const { data: created, error: authError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password: body.password,
      email_confirm: true, 
      user_metadata: { full_name: body.fullName }
    });

    if (authError || !created.user) {
      return NextResponse.json({ error: authError?.message || "Could not create user." }, { status: 400 });
    }

    let referredBy: string | null = null;
    if (body.referralCode) {
      const { data: referrer } = await admin.from("profiles").select("id").eq("referral_code", body.referralCode).maybeSingle();
      referredBy = referrer?.id || null;
    }

    const referralCode = generateReferralCode(normalizedEmail);
    const { error: profileError } = await admin.from("profiles").insert({
      id: created.user.id,
      full_name: body.fullName,
      email: normalizedEmail,
      referral_code: referralCode,
      referred_by: referredBy,
      email_verified_at: new Date().toISOString() // Instantly marking email as verified
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    if (referredBy) {
      await admin.from("referrals").insert({ referrer_id: referredBy, referred_id: created.user.id, status: "REGISTERED" });
    }

    await admin.from("activity_logs").insert({ actor_id: created.user.id, action: "USER_REGISTERED", metadata: { email: normalizedEmail } });
    
    // Send standard welcome email without links
    await sendEmail({ to: normalizedEmail, subject: "Welcome to NovaVest Capital", html: emails.welcome(body.fullName) });
    await sendAdminEmail("New NovaVest Capital registration", emails.adminNewRegistration(body.fullName, normalizedEmail));

    return NextResponse.json({ ok: true, userId: created.user.id, message: "Account created successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Invalid request." }, { status: 400 });
  }
}