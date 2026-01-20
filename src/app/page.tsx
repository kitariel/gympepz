import Hero from "@/components/landing/Hero";
import FeaturesSection from "@/components/landing/FeaturesSection";
import FinalCTA from "@/components/landing/FinalCTA";

export default function HomePage() {
  const ctaHref = "/train";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Hero ctaHref={ctaHref} />
      <FeaturesSection />
      <FinalCTA ctaHref={ctaHref} />
    </main>
  );
}
