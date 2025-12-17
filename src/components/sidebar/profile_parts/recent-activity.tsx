"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, ChevronRight, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Workout {
  id: string;
  date: Date | string;
  completed: boolean;
  duration?: number;
  planDay?: {
    title: string;
  };
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
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Dumbbell className="h-3.5 w-3.5 text-teal-600" />
              Recent Activity
            </h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-[10px] text-primary hover:text-primary/80"
              onClick={() => router.push("/portal/log?tab=workouts")}
            >
              View All
              <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </div>
          
          <div className="space-y-1.5">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="flex items-start gap-2 p-2 rounded-lg bg-gradient-to-r from-teal-50/50 to-emerald-50/50 dark:from-teal-950/20 dark:to-emerald-950/20 hover:from-teal-100/70 hover:to-emerald-100/70 dark:hover:from-teal-950/30 dark:hover:to-emerald-950/30 transition-all cursor-pointer group"
                onClick={() => router.push(`/portal/log/workout/${workout.id}`)}
              >
                <div className="p-1.5 rounded-full bg-teal-100 dark:bg-teal-900/30 shrink-0 group-hover:scale-110 transition-transform">
                  <Dumbbell className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">
                    {workout.planDay?.title ?? "Workout"}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(workout.date), {
                      addSuffix: true,
                    })}
                  </div>
                  {workout._count?.exercises && workout._count.exercises > 0 && (
                    <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                      <span>{workout._count.exercises} exercises</span>
                      {workout.duration && (
                        <>
                          <span>•</span>
                          <span>{workout.duration} min</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {workout.completed && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 group-hover:scale-110 transition-transform" />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
