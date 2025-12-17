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
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3">
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold text-foreground mb-2.5 flex items-center gap-1.5">
            <span className="text-muted-foreground">📅</span>
            This Month
          </h4>
          
          <div className="grid grid-cols-3 gap-2">
            {/* Workouts */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-lg p-2 text-center">
              <Dumbbell className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                {workouts}
              </div>
              <div className="text-[9px] text-muted-foreground font-medium mt-0.5">
                Workouts
              </div>
            </div>

            {/* Volume */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-lg p-2 text-center">
              <TrendingUp className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                {volume > 0 ? `${(volume / 1000).toFixed(1)}k` : "0"}
              </div>
              <div className="text-[9px] text-muted-foreground font-medium mt-0.5">
                Volume (kg)
              </div>
            </div>

            {/* Duration */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 rounded-lg p-2 text-center">
              <Clock className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-orange-700 dark:text-orange-400">
                {averageDuration ? averageDuration : "—"}
              </div>
              <div className="text-[9px] text-muted-foreground font-medium mt-0.5">
                Avg (min)
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
