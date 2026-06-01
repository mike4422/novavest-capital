import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function requireUser() {
  const { supabase, user } = await getCurrentUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email_verified_at, status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.email_verified_at) {
    redirect(`/login?confirm=1&email=${encodeURIComponent(user.email || "")}`);
  }

  if (profile.status === "SUSPENDED") {
    redirect("/login?suspended=1");
  }

  return { supabase, user };
}

export async function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const admin = createAdminClient();
  const { data } = await admin
    .from("admin_roles")
    .select("email, role, active")
    .eq("email", email.toLowerCase())
    .eq("active", true)
    .maybeSingle();

  return data?.role === "admin" || data?.role === "super_admin";
}

export async function requireAdmin() {
  const { supabase, user } = await requireUser();
  const allowed = await isAdminEmail(user.email);
  if (!allowed) redirect("/dashboard");
  return { supabase, user };
}

export async function assertAdminFromRequest() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdminEmail(user.email))) {
    throw new Response("Forbidden", { status: 403 });
  }
  return user;
}
