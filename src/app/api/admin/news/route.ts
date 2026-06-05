import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    
    const { data, error } = await admin
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ ok: true, news: [], warning: "News table missing. Please run the SQL snippet." });
      }
      throw error;
    }
    
    return NextResponse.json({ ok: true, news: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch news." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const { id, title, content, published } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
    }

    let result;
    if (id) {
      // Update existing article
      result = await admin.from("news").update({ title, content, published }).eq("id", id);
    } else {
      // Create new article
      result = await admin.from("news").insert({ title, content, published });
    }

    if (result.error) throw result.error;

    await admin.from("activity_logs").insert({
      action: id ? "NEWS_ARTICLE_UPDATED" : "NEWS_ARTICLE_CREATED",
      metadata: { title }
    });

    return NextResponse.json({ ok: true, message: id ? "Article updated successfully." : "Article published successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save news article." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Article ID is required." }, { status: 400 });

    const { error } = await admin.from("news").delete().eq("id", id);
    if (error) throw error;

    await admin.from("activity_logs").insert({
      action: "NEWS_ARTICLE_DELETED",
      metadata: { id }
    });

    return NextResponse.json({ ok: true, message: "Article deleted successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete article." }, { status: 500 });
  }
}