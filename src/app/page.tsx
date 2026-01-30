import Hero from "@/components/landing/Hero";
import LandingHeader from "@/components/landing/LandingHeader";
import FeaturesSection from "@/components/landing/FeaturesSection";
import WeeklyPlanSection from "@/components/landing/WeeklyPlanSection";
import OfflineLoggingSection from "@/components/landing/OfflineLoggingSection";
import SocialProofSection from "@/components/landing/SocialProofSection";
import FAQSection from "@/components/landing/FAQSection";
import ContactSection from "@/components/landing/ContactSection";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import AnimatedSeparator from "@/components/landing/AnimatedSeparator";

export default function HomePage() {
  const ctaHref = "/train";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <LandingHeader ctaHref={ctaHref} />
      <Hero ctaHref={ctaHref} />
      <FeaturesSection />
      <AnimatedSeparator />
      <WeeklyPlanSection />
      <OfflineLoggingSection />
      <AnimatedSeparator />
      <SocialProofSection />
      <FAQSection />
      <ContactSection />
      <FinalCTA ctaHref={ctaHref} />
      <Footer />
    </main>
  );
}
