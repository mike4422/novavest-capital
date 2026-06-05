import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    
    const { data, error } = await admin
      .from("custom_pages")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ ok: true, pages: [], warning: "Custom Pages table missing. Please run the SQL snippet." });
      }
      throw error;
    }
    
    return NextResponse.json({ ok: true, pages: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch custom pages." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const { id, title, slug, content, published } = await request.json();

    if (!title || !slug || !content) {
      return NextResponse.json({ error: "Title, slug, and content are required." }, { status: 400 });
    }

    // Ensure the slug is URL-friendly
    const formattedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    let result;
    if (id) {
      result = await admin.from("custom_pages").update({ title, slug: formattedSlug, content, published }).eq("id", id);
    } else {
      result = await admin.from("custom_pages").insert({ title, slug: formattedSlug, content, published });
    }

    if (result.error) {
      if (result.error.code === '23505') {
        return NextResponse.json({ error: "A page with this URL slug already exists." }, { status: 400 });
      }
      throw result.error;
    }

    await admin.from("activity_logs").insert({
      action: id ? "CUSTOM_PAGE_UPDATED" : "CUSTOM_PAGE_CREATED",
      metadata: { title, slug: formattedSlug }
    });

    return NextResponse.json({ ok: true, message: id ? "Page updated successfully." : "Page published successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save custom page." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Page ID is required." }, { status: 400 });

    const { error } = await admin.from("custom_pages").delete().eq("id", id);
    if (error) throw error;

    await admin.from("activity_logs").insert({
      action: "CUSTOM_PAGE_DELETED",
      metadata: { id }
    });

    return NextResponse.json({ ok: true, message: "Page deleted successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete page." }, { status: 500 });
  }
}