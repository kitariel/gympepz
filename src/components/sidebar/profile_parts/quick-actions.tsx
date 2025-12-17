"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, BarChart3, Target, Dumbbell, TrendingUp, Clock } from "lucide-react";

interface QuickActionsProps {
  activePlanId?: string;
  workouts: number;
  volume: number;
  averageDuration?: number;
}

export function QuickActions({ 
  activePlanId,
  workouts,
  volume,
  averageDuration,
}: QuickActionsProps) {
  const router = useRouter();

  const handleStartWorkout = () => {
    if (activePlanId) {
      router.push(`/portal/log?quickStart=${activePlanId}`);
    } else {
      router.push("/portal/log");
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3 space-y-2.5">
        {/* Start Workout Button */}
        <Button
          className="w-full bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white h-8 text-xs font-semibold"
          onClick={handleStartWorkout}
        >
          <Play className="h-3 w-3 mr-1.5" />
          Start Workout
        </Button>

        {/* Monthly Stats - Compact Inline */}
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950/30 dark:to-slate-900/30 rounded-lg px-2 py-1.5 gap-1.5">
          <div className="flex items-center gap-1 flex-1">
            <Dumbbell className="h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                {workouts}
              </span>
              <span className="text-[8px] text-muted-foreground">Workouts</span>
            </div>
          </div>
          
          <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
          
          <div className="flex items-center gap-1 flex-1">
            <TrendingUp className="h-3 w-3 text-purple-600 dark:text-purple-400 shrink-0" />
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-bold text-purple-700 dark:text-purple-400">
                {volume > 0 ? `${(volume / 1000).toFixed(1)}k` : "0"}
              </span>
              <span className="text-[8px] text-muted-foreground">kg</span>
            </div>
          </div>
          
          <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
          
          <div className="flex items-center gap-1 flex-1">
            <Clock className="h-3 w-3 text-orange-600 dark:text-orange-400 shrink-0" />
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-bold text-orange-700 dark:text-orange-400">
                {averageDuration ? averageDuration : "—"}
              </span>
              <span className="text-[8px] text-muted-foreground">min</span>
            </div>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[10px]"
            onClick={() => router.push("/portal/log")}
          >
            <BarChart3 className="h-3 w-3 mr-1" />
            Progress
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[10px]"
            onClick={() => router.push("/portal/plans")}
          >
            <Target className="h-3 w-3 mr-1" />
            Plans
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
