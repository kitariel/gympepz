import Hero from "@/components/landing/Hero";
import WeeklyPlanSection from "@/components/landing/WeeklyPlanSection";
import OfflineLoggingSection from "@/components/landing/OfflineLoggingSection";
import BetaNotice from "@/components/landing/BetaNotice";
import FinalCTA from "@/components/landing/FinalCTA";

export default function HomePage() {
  const ctaHref = "/portal";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Hero ctaHref={ctaHref} />
      <WeeklyPlanSection />
      <OfflineLoggingSection />
      <BetaNotice />
      <FinalCTA ctaHref={ctaHref} />
    </main>
  );
}
