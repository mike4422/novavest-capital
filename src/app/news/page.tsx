import { Calendar, Newspaper, ArrowRight } from "lucide-react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "News & Announcements | NovaVest Capital",
  description: "Stay up to date with the latest platform news, market insights, and feature updates.",
};

export default async function PublicNewsPage() {
  const supabase = await createClient();
  
  // Fetch only PUBLISHED articles, newest first
  const { data: news } = await supabase
    .from("news")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <>
      <PublicNavbar />
      
      <main className="min-h-screen py-24 page-shell relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-3xl mx-auto relative z-10 text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-3 py-1 text-sm">
            Platform Updates
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">News & Announcements</h1>
          <p className="text-lg text-slate-400">
            Stay informed with the latest milestones, market insights, and security upgrades from the NovaVest Capital team.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {!news || news.length === 0 ? (
            <Card className="glass-card p-16 text-center">
              <Newspaper className="h-12 w-12 text-slate-600 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-slate-300">No news published yet</h3>
              <p className="text-slate-500 mt-2">Check back soon for exciting updates and announcements.</p>
            </Card>
          ) : (
            <div className="space-y-8">
              {news.map((article: any) => (
                <Card key={article.id} className="glass-card p-8 hover:-translate-y-1 transition-transform duration-300 border-indigo-500/10 hover:border-indigo-500/30 group">
                  <div className="flex items-center gap-2 text-sm text-indigo-400 font-mono mb-4">
                    <Calendar className="h-4 w-4" />
                    {new Date(article.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white group-hover:text-indigo-300 transition-colors">
                    {article.title}
                  </h2>
                  
                  {/* Rendering simple HTML if you used it in the admin textarea, or standard text */}
                  <div 
                    className="prose prose-invert max-w-none text-slate-400 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                  
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

// Temporary Badge component for this file if not exported globally
function Badge({ children, className, variant = "default" }: any) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </span>
  );
}