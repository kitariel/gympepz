"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
        <div className="space-y-1.5">
          <div className="mb-1.5 flex items-center justify-between">
            <h4 className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
              <Dumbbell className="text-primary h-3.5 w-3.5" />
              Recent Activity
            </h4>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary/80 h-auto p-0 text-[10px]"
              onClick={() => router.push("/portal/log?tab=workouts")}
            >
              View All
              <ChevronRight className="ml-0.5 h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-1">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="bg-primary/5 hover:bg-primary/10 group flex cursor-pointer items-center gap-1.5 rounded-lg p-1.5 transition-all"
                onClick={() => router.push(`/portal/log/workout/${workout.id}`)}
              >
                <div className="bg-primary/10 shrink-0 rounded-full p-1 transition-transform group-hover:scale-110">
                  <Dumbbell className="text-primary h-2.5 w-2.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-foreground truncate text-xs font-semibold">
                    {workout.planDay?.title ?? "Workout"}
                  </div>
                  <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-[9px]">
                    <span>
                      {formatDistanceToNow(new Date(workout.date), {
                        addSuffix: true,
                      })}
                    </span>
                    {workout._count?.exercises &&
                      workout._count.exercises > 0 && (
                        <>
                          <span>•</span>
                          <span>{workout._count.exercises} ex</span>
                        </>
                      )}
                    {workout.duration && (
                      <>
                        <span>•</span>
                        <span>{workout.duration}m</span>
                      </>
                    )}
                  </div>
                </div>
                {workout.completed && (
                  <CheckCircle2 className="text-primary h-3 w-3 shrink-0 transition-transform group-hover:scale-110" />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
