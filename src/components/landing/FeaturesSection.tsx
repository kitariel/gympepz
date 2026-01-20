import { Clock, Copy, TrendingUp, Zap } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Copy,
      title: "Copy Last Set",
      description:
        "Tap once to copy your previous set's weight and reps. No more typing the same numbers.",
    },
    {
      icon: TrendingUp,
      title: "See Previous Performance",
      description:
        "Know exactly what you lifted last time. Make progress every session.",
    },
    {
      icon: Clock,
      title: "Rest Timer",
      description:
        "60, 90, or 120 second presets. Focus on your lift, not the clock.",
    },
    {
      icon: Zap,
      title: "Works Offline",
      description:
        "Log workouts even when gym WiFi fails. Everything saves locally first.",
    },
  ];

  return (
    <section id="features" className="w-full border-y bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for the gym
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Every feature designed to make logging faster and training smarter.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="relative rounded-2xl border bg-background p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-lg bg-emerald-500/10 p-3">
                  <Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
