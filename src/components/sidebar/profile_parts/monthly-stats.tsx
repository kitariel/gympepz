"use client";

import { Dumbbell, TrendingUp, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthlyStatsProps {
  workouts: number;
  volume: number;
  averageDuration?: number;
  prs?: number;
}

export function MonthlyStats({
  workouts,
  volume,
  averageDuration,
  prs = 0,
}: MonthlyStatsProps) {
  const stats = [
    {
      icon: Dumbbell,
      value: workouts,
      label: "Workouts",
    },
    {
      icon: TrendingUp,
      value: volume > 0 ? `${(volume / 1000).toFixed(1)}k` : "0",
      label: "Volume (kg)",
    },
    {
      icon: Clock,
      value: averageDuration ?? "—",
      label: "Avg Min",
    },
    {
      icon: Target,
      value: prs,
      label: "PRs",
    },
  ];

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        30-Day Stats
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={cn(
              "rounded-xl p-3 transition-all",
              "bg-muted/50 border border-transparent",
              "hover:border-primary/20 hover:bg-muted"
            )}
          >
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-1.5 bg-primary/10">
                <stat.icon className="h-3.5 w-3.5 text-primary" />
              </div>
              <div>
                <div className="text-lg font-bold tracking-tight text-foreground">
                  {stat.value}
                </div>
                <div className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
