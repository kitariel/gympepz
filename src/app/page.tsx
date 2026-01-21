import Hero from "@/components/landing/Hero";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
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
      <Hero ctaHref={ctaHref} />
      <FeaturesSection />
      <HowItWorksSection />
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
