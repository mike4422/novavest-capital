import { Footer } from "@/components/layout/footer";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { FAQSection } from "@/components/landing/faq-section";
import { HeroSection } from "@/components/landing/hero-section";
import { InvestmentPlans } from "@/components/landing/investment-plans";
import { LiveStats } from "@/components/landing/live-stats";
import { LiveTransactions } from "@/components/landing/live-transactions";
import { Testimonials } from "@/components/landing/testimonials";
import { WhyChooseUs } from "@/components/landing/why-choose-us";

export default function HomePage() {
  return (
    <main>
      <PublicNavbar />
      <HeroSection />
      <LiveStats />
      <InvestmentPlans />
      <WhyChooseUs />
      <LiveTransactions />
      <Testimonials />
      <FAQSection />
      <Footer />
    </main>
  );
}
