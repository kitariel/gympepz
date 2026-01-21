import { TrendingUp, Users, Dumbbell, Clock } from "lucide-react";

export default function StatsSection() {
  const stats = [
    {
      icon: Users,
      value: "10K+",
      label: "Active Users",
      description: "Athletes training smarter",
    },
    {
      icon: Dumbbell,
      value: "500K+",
      label: "Workouts Logged",
      description: "Sets tracked and counted",
    },
    {
      icon: TrendingUp,
      value: "85%",
      label: "More Consistent",
      description: "Users report better adherence",
    },
    {
      icon: Clock,
      value: "30 sec",
      label: "Average Log Time",
      description: "From start to finish",
    },
  ];

  return (
    <section className="w-full border-y bg-muted/20 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="mb-4 inline-flex rounded-xl bg-emerald-500/10 p-4">
                  <Icon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="mb-2 text-4xl font-bold tracking-tight">
                  {stat.value}
                </div>
                <div className="mb-1 text-lg font-semibold">{stat.label}</div>
                <div className="text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
