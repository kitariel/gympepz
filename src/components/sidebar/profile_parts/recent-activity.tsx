"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell } from "lucide-react";
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-primary"
            onClick={() => router.push("/portal/log?tab=workouts")}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {workouts.map((workout) => (
          <div
            key={workout.id}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
            onClick={() => router.push(`/portal/log/workout/${workout.id}`)}
          >
            <div className="p-2 rounded-full bg-primary/10 shrink-0">
              <Dumbbell className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">
                {workout.planDay?.title ?? "Workout"}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(workout.date), {
                  addSuffix: true,
                })}
              </div>
              {workout._count?.exercises && workout._count.exercises > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  {workout._count.exercises} exercises
                  {workout.duration && ` • ${workout.duration} min`}
                </div>
              )}
            </div>
            {workout.completed && (
              <Badge variant="success" className="shrink-0">
                ✓
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
