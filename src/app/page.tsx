import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { FAQSection } from "@/components/landing/faq-section";
import { HeroSection } from "@/components/landing/hero-section";
import { InvestmentPlans } from "@/components/landing/investment-plans";
import { LiveStats } from "@/components/landing/live-stats";
import { LiveTransactions } from "@/components/landing/live-transactions";
import { Testimonials } from "@/components/landing/testimonials";
import { WhyChooseUs } from "@/components/landing/why-choose-us";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  
  // Fetch the 3 latest published news articles directly from the database
  const { data: news } = await supabase
    .from("news")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <main>
      <PublicNavbar />
      <HeroSection />
      <LiveStats />
      <InvestmentPlans />
      <WhyChooseUs />
      <LiveTransactions />
      <Testimonials />
      
      {/* Dynamic News Section */}
      {news && news.length > 0 && (
        <section className="py-24 page-shell relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest Updates</h2>
              <p className="text-slate-400 max-w-2xl">
                Stay informed with our most recent platform announcements, milestones, and market insights.
              </p>
            </div>
            <Link href="/news" className="shrink-0 flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-full">
              View All News <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.map((article: any) => (
              <Link key={article.id} href="/news" className="group block h-full">
                <div className="glass-card p-8 h-full flex flex-col hover:-translate-y-2 transition-all duration-300 border-white/5 hover:border-indigo-500/30">
                  <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-4">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-slate-400 line-clamp-3 mb-8 flex-1">
                    {/* This strips any HTML tags out of the preview so it displays cleanly as plain text */}
                    {article.content.replace(/<[^>]*>?/gm, '')}
                  </p>
                  
                  <div className="mt-auto flex items-center text-sm font-bold text-indigo-400 group-hover:text-indigo-300">
                    Read Full Article 
                    <ArrowRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <FAQSection />
      <Footer />
    </main>
  );
}