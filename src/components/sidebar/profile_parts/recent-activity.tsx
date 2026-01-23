"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dumbbell, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Workout {
  id: string;
  date: Date | string;
  completed: boolean;
  duration?: number;
  _count?: {
    exercises: number;
  };
}

interface RecentActivityProps {
  workouts: Workout[];
}

export function RecentActivity({ workouts }: RecentActivityProps) {
  const router = useRouter();

  if (!workouts || workouts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Dumbbell className="h-3.5 w-3.5 text-primary" />
          Recent Activity
        </h4>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-[10px] text-primary hover:text-primary/80"
          onClick={() => router.push("/portal/train/history")}
        >
          View All
          <ChevronRight className="ml-0.5 h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-1.5">
        {workouts.map((workout, index) => (
          <div
            key={workout.id}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl p-2.5 transition-all cursor-pointer",
              "bg-muted/50 hover:bg-muted",
              "border border-transparent hover:border-primary/20"
            )}
            onClick={() => router.push("/portal/train/history")}
          >
            {/* Timeline indicator */}
            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-all",
                  workout.completed
                    ? "bg-green-500 text-white"
                    : "bg-primary text-primary-foreground"
                )}
              >
                {workout.completed ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Dumbbell className="h-4 w-4" />
                )}
              </div>
              {index < workouts.length - 1 && (
                <div className="absolute top-9 h-4 w-0.5 bg-border/50" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground truncate">
                  Workout Session
                </span>
                {workout.completed && (
                  <span className="text-[9px] font-semibold text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                    DONE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                <span>
                  {formatDistanceToNow(new Date(workout.date), {
                    addSuffix: true,
                  })}
                </span>
                {workout._count?.exercises && workout._count.exercises > 0 && (
                  <>
                    <span className="text-border">•</span>
                    <span className="flex items-center gap-0.5">
                      <Dumbbell className="h-2.5 w-2.5" />
                      {workout._count.exercises} exercises
                    </span>
                  </>
                )}
                {workout.duration && (
                  <>
                    <span className="text-border">•</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {workout.duration}m
                    </span>
                  </>
                )}
              </div>
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
}
