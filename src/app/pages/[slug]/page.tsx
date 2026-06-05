import { notFound } from "next/navigation";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data: page } = await supabase.from("custom_pages").select("title").eq("slug", params.slug).single();
  
  return {
    title: page ? `${page.title} | NovaVest Capital` : "Page Not Found",
  };
}

export default async function CustomPageRender({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  
  // Fetch the page by its dynamic slug
  const { data: page, error } = await supabase
    .from("custom_pages")
    .select("*")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  if (error || !page) {
    notFound(); // Redirects to standard 404 page if slug is wrong or unpublished
  }

  return (
    <>
      <PublicNavbar />
      
      <main className="min-h-screen py-24 page-shell relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-teal-500/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <Card className="glass-card p-8 md:p-12 border-teal-500/20">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8 text-white border-b border-white/10 pb-6">
              {page.title}
            </h1>
            
            <div 
              className="prose prose-invert prose-teal max-w-none prose-headings:font-bold prose-a:text-teal-400 hover:prose-a:text-teal-300 leading-loose"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </Card>
        </div>
      </main>

      <Footer />
    </>
  );
}