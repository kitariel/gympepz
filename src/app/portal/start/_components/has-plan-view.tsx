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
    <div className="container mx-auto max-w-4xl space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Active Plan Card - No card styling on mobile */}
      <Card className="border-0 bg-transparent shadow-none sm:bg-muted/50 sm:shadow-lg sm:shadow-xl">
        <CardHeader className="px-0 pt-0 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <div className="bg-primary shrink-0 rounded-lg p-1.5 sm:p-2">
                <Target className="text-primary-foreground h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-base sm:text-lg">
                  {plan.name}
                </CardTitle>
                <CardDescription className="mt-0.5 text-xs">
                  Active Plan
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="shrink-0 text-xs">
              Active
            </Badge>
          </div>
        </CardHeader>
        <Separator className="hidden sm:block" />
        <CardContent className="space-y-4 px-0 pt-4 pb-4 sm:space-y-6 sm:px-6 sm:pt-6 sm:pb-6">
          {todayWorkout ? (
            <>
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Calendar className="text-primary h-4 w-4 shrink-0" />
                  <h3 className="truncate text-sm font-semibold sm:text-base">
                    <span className="hidden sm:inline">Today&apos;s Workout: </span>
                    {todayWorkout.title}
                  </h3>
                </div>
                <div className="dark:bg-background/50 space-y-2 rounded-lg bg-white/50 p-3 sm:space-y-3 sm:p-4">
                  {todayWorkout.exercises.length > 0 ? (
                    <div className="space-y-2">
                      {todayWorkout.exercises.map((exercise, idx) => (
                        <div
                          key={exercise.id}
                          className="dark:hover:bg-background/70 flex items-center justify-between gap-2 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-white/70 active:bg-white/80 sm:py-2.5"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                            <span className="text-muted-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">
                                {exercise.exerciseName}
                              </p>
                              <p className="text-muted-foreground truncate text-xs">
                                {exercise.muscleGroup}
                              </p>
                            </div>
                          </div>
                          <div className="text-muted-foreground shrink-0 text-right text-xs">
                            <p className="font-medium whitespace-nowrap">
                              {exercise.sets}×{exercise.reps}
                            </p>
                            {exercise.weight && (
                              <p className="whitespace-nowrap">{exercise.weight}kg</p>
                            )}
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
              
              {/* Mobile-optimized CTA button */}
              <Button
                size="lg"
                onClick={onStartWorkout}
                disabled={
                  isStarting ||
                  (todayWorkout.exercises?.length ?? 0) === 0
                }
                className="h-14 w-full bg-gradient-to-r from-blue-500 to-emerald-500 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 sm:h-12"
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
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                No workout scheduled for today
              </p>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push(`/portal/plans/${plan.id}`)}
                className="h-11 sm:h-10"
              >
                View Plan Details
              </Button>
            </div>
          )}

          {/* Mobile-optimized footer links */}
          <div className="flex flex-col items-center justify-center gap-2 pt-2 sm:flex-row">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/portal/plans")}
              className="h-9 text-xs sm:h-8"
            >
              View All Plans
            </Button>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/portal/workout-builder")}
              className="h-9 text-xs sm:h-8"
            >
              Create New Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

