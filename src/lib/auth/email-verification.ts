import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const TOKEN_BYTES = 32;
const DEFAULT_EXPIRES_HOURS = 24;

export function createRawEmailToken() {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

export function hashEmailToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function getEmailConfirmationUrl(token: string) {
  return `${getSiteUrl()}/api/auth/confirm-email?token=${encodeURIComponent(token)}`;
}

export async function createEmailVerificationToken({
  admin,
  userId,
  email,
  expiresInHours = DEFAULT_EXPIRES_HOURS
}: {
  admin: SupabaseClient;
  userId: string;
  email: string;
  expiresInHours?: number;
}) {
  const token = createRawEmailToken();
  const tokenHash = hashEmailToken(token);
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();

  await admin
    .from("email_verification_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("used_at", null);

  const { error } = await admin.from("email_verification_tokens").insert({
    user_id: userId,
    email,
    token_hash: tokenHash,
    expires_at: expiresAt
  });

  if (error) throw new Error(error.message);

  return {
    token,
    tokenHash,
    expiresAt,
    confirmationUrl: getEmailConfirmationUrl(token)
  };
}
