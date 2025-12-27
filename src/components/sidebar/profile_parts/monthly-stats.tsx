"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, TrendingUp, Clock } from "lucide-react";

interface MonthlyStatsProps {
  workouts: number;
  volume: number;
  averageDuration?: number;
}

export function MonthlyStats({
  workouts,
  volume,
  averageDuration,
}: MonthlyStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {/* Workouts */}
      <div className="bg-muted/50 hover:border-border rounded-lg border border-transparent p-3 text-center transition-colors">
        <Dumbbell className="text-primary mx-auto mb-1.5 h-4 w-4" />
        <div className="text-xl font-bold tracking-tight">{workouts}</div>
        <div className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
          Workouts
        </div>
      </div>

      {/* Volume */}
      <div className="bg-muted/50 hover:border-border rounded-lg border border-transparent p-3 text-center transition-colors">
        <TrendingUp className="text-primary mx-auto mb-1.5 h-4 w-4" />
        <div className="text-xl font-bold tracking-tight">
          {volume > 0 ? `${(volume / 1000).toFixed(1)}k` : "0"}
        </div>
        <div className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
          Vol (kg)
        </div>
      </div>

      {/* Duration */}
      <div className="bg-muted/50 hover:border-border rounded-lg border border-transparent p-3 text-center transition-colors">
        <Clock className="text-primary mx-auto mb-1.5 h-4 w-4" />
        <div className="text-xl font-bold tracking-tight">
          {averageDuration ?? "—"}
        </div>
        <div className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
          Avg (min)
        </div>
      </div>
    </div>
  );
}
