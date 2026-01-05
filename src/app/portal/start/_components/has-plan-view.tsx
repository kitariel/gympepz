/**
 * Component shown when user has an active workout plan
 */

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Play, Target, Dumbbell } from "lucide-react";

interface HasPlanViewProps {
  plan: {
    id: string;
    name: string;
  };
  todayWorkout: {
    id: string;
    title: string;
    isRestDay: boolean;
    exercises: Array<{
      id: string;
      exerciseName: string;
      muscleGroup: string;
      sets: number;
      reps: number;
      weight?: number | null;
    }>;
  } | null;
  onStartWorkout: () => void;
  isStarting: boolean;
}

export function HasPlanView({
  plan,
  todayWorkout,
  onStartWorkout,
  isStarting,
}: HasPlanViewProps) {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-3xl font-bold">Start Working Out</h1>
        <p className="text-muted-foreground">
          Ready to crush today&apos;s workout?
        </p>
      </div>

      {/* Active Plan Card */}
      <Card className="bg-muted/50 border-0 shadow-lg">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-lg p-2">
                <Target className="text-primary-foreground h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription className="mt-0.5 text-xs">
                  Active Plan
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              Active
            </Badge>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-6 px-6 pt-6 pb-6">
          {todayWorkout ? (
            <>
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Calendar className="text-primary h-4 w-4" />
                  <h3 className="text-base font-semibold">
                    Today&apos;s Workout: {todayWorkout.title}
                  </h3>
                </div>
                <div className="dark:bg-background/50 space-y-3 rounded-lg bg-white/50 p-4">
                  {todayWorkout.exercises.length > 0 ? (
                    <div className="space-y-2">
                      {todayWorkout.exercises.map((exercise, idx) => (
                        <div
                          key={exercise.id}
                          className="dark:hover:bg-background/70 flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white/70"
                        >
                          <div className="flex flex-1 items-center gap-3">
                            <span className="text-muted-foreground w-6 shrink-0 text-xs font-medium">
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium">
                                {exercise.exerciseName}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {exercise.muscleGroup}
                              </p>
                            </div>
                          </div>
                          <div className="text-muted-foreground ml-3 shrink-0 text-right text-xs">
                            <p className="font-medium">
                              {exercise.sets} sets × {exercise.reps} reps
                            </p>
                            {exercise.weight && <p>{exercise.weight} kg</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground py-4 text-center text-sm">
                      No exercises scheduled for this day
                    </p>
                  )}
                </div>
              </div>
              <Button
                size="lg"
                onClick={onStartWorkout}
                disabled={
                  isStarting ||
                  (todayWorkout.exercises?.length ?? 0) === 0
                }
                className="h-12 w-full bg-gradient-to-br from-teal-600 to-teal-700 text-base font-semibold text-white hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStarting ? (
                  <>
                    <Dumbbell className="mr-2 h-5 w-5 animate-spin" />
                    Starting...
                  </>
                ) : (todayWorkout.exercises?.length ?? 0) === 0 ? (
                  <>
                    {todayWorkout.isRestDay ? (
                      <>
                        <Calendar className="mr-2 h-5 w-5" />
                        Rest Day
                      </>
                    ) : (
                      <>
                        <Target className="mr-2 h-5 w-5" />
                        No Exercises Scheduled
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Start Workout Now
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                No workout scheduled for today
              </p>
              <Button
                variant="outline"
                onClick={() => router.push(`/portal/plans/${plan.id}`)}
              >
                View Plan Details
              </Button>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/portal/plans")}
              className="text-xs"
            >
              View All Plans
            </Button>
            <span className="text-muted-foreground">•</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/portal/workout-builder")}
              className="text-xs"
            >
              Create New Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

