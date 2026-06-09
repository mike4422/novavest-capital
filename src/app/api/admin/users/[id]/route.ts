import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const body = await request.json();
    
    // Await params to comply with Next.js 15+ routing rules
    const { id } = await params; 

    // 1. Update the public profiles table
    const { error: profileError } = await admin
      .from("profiles")
      .update({
        full_name: body.full_name,
        email: body.email,
        status: body.status,
        balance: Number(body.balance)
      })
      .eq("id", id);

    if (profileError) throw profileError;

    // 2. Update the hidden Auth credentials
    const authUpdates: any = {};
    if (body.email) authUpdates.email = body.email;
    if (body.password && body.password.trim() !== "") {
      authUpdates.password = body.password; // Only update if admin typed a new one
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await admin.auth.admin.updateUserById(id, authUpdates);
      if (authError) throw authError;
    }

    return NextResponse.json({ ok: true, message: "User updated successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    
    // Await params to comply with Next.js 15+ routing rules
    const { id } = await params; 

    // Deleting from auth.users automatically cascades and deletes their profile, 
    // deposits, withdrawals, and investments based on your schema.
    const { error } = await admin.auth.admin.deleteUser(id);
    
    if (error) throw error;

    // Log the administrative action
    await admin.from("activity_logs").insert({
      action: "ADMIN_DELETED_USER",
      metadata: { target_user: id }
    });

    return NextResponse.json({ ok: true, message: "User permanently deleted." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete user." }, { status: 500 });
  }
}