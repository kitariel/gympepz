"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Sparkles,
  Dumbbell,
  ArrowRight,
  Plus,
  Target,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { QuickPlanWizard } from "./_components/quick-plan-wizard";

export default function StartWorkoutPage() {
  const { data: session } = useSession();
  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);
  const router = useRouter();
  const [showPlanChoices, setShowPlanChoices] = useState(false);
  const [showQuickWizard, setShowQuickWizard] = useState(false);

  // Get today's workout
  const todaysWorkout = api.plan.getTodaysWorkout.useQuery(
    { userId },
    { enabled: !!userId }
  );

  // Quick start mutation
  const quickStart = api.workoutLog.quickStart.useMutation({
    onSuccess: (log) => {
      router.push(`/portal/log/workout/${log.id}`);
    },
    onError: (error) => {
      console.error("Failed to start workout:", error);
    },
  });

  const handleStartWorkout = () => {
    if (!userId) return;
    quickStart.mutate({ userId });
  };

  // Loading state
  if (todaysWorkout.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Dumbbell className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading your workout...</p>
        </div>
      </div>
    );
  }

  const { hasPlan, plan, todayWorkout } = todaysWorkout.data ?? {};

  // No plan - show plan creation options
  if (!hasPlan || !plan) {
    // Show quick wizard if user chose manual builder
    if (showQuickWizard) {
      return (
        <div className="container max-w-4xl mx-auto p-6">
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl font-bold">Quick Plan Builder</h1>
            <p className="text-muted-foreground text-sm">
              Build your workout plan in minutes
            </p>
          </div>
          <QuickPlanWizard
            userId={userId}
            onComplete={async () => {
              setShowQuickWizard(false);
              await todaysWorkout.refetch();
            }}
            onCancel={() => setShowQuickWizard(false)}
          />
        </div>
      );
    }

    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold">Start Working Out</h1>
          <p className="text-muted-foreground">
            Create a workout plan to get started
          </p>
        </div>

        {!showPlanChoices ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center">
                <Target className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  No Workout Plan Found
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  You need to create a workout plan before you can start working out.
                  Choose how you'd like to create your plan.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => setShowPlanChoices(true)}
                className="bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
              >
                Create Workout Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-teal-500"
              onClick={() => setShowQuickWizard(true)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Dumbbell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle>Manual Builder</CardTitle>
                  </div>
                </div>
                <CardDescription>
                  Quickly build your workout plan step by step
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    Select day and body part (Push/Pull/Legs)
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    Choose exercises
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    Set sets, reps, and weight
                  </li>
                </ul>
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => setShowQuickWizard(true)}
                >
                  Start Building
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-500"
              onClick={() => router.push("/portal/ai-planner")}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>AI Planner</CardTitle>
                </div>
                <CardDescription>
                  Let AI create a personalized workout plan for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    Select your fitness goals
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    Choose experience level
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    AI generates your plan
                  </li>
                </ul>
                <Button 
                  className="w-full"
                  onClick={() => router.push("/portal/ai-planner")}
                >
                  Use AI Planner
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Has plan - show today's workout
  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Start Working Out</h1>
        <p className="text-muted-foreground">
          Ready to crush today's workout?
        </p>
      </div>

      {/* Active Plan Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-600 rounded-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription className="text-xs mt-0.5">
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
        <CardContent className="px-6 pt-6 pb-6 space-y-6">
          {todayWorkout ? (
            <>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-teal-600" />
                  <h3 className="font-semibold text-base">
                    Today's Workout: {todayWorkout.title}
                  </h3>
                </div>
                <div className="bg-white/50 dark:bg-background/50 rounded-lg p-4 space-y-3">
                  {todayWorkout.exercises.length > 0 ? (
                    <div className="space-y-2">
                      {todayWorkout.exercises.slice(0, 5).map((exercise, idx) => (
                        <div
                          key={exercise.id}
                          className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground text-xs w-6">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-medium">{exercise.exerciseName}</p>
                              <p className="text-xs text-muted-foreground">
                                {exercise.muscleGroup}
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>
                              {exercise.sets} sets × {exercise.reps} reps
                            </p>
                            {exercise.weight && (
                              <p>{exercise.weight} kg</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {todayWorkout.exercises.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                          + {todayWorkout.exercises.length - 5} more exercises
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No exercises scheduled for this day
                    </p>
                  )}
                </div>
              </div>
              <Button
                size="lg"
                onClick={handleStartWorkout}
                disabled={quickStart.isPending}
                className="w-full bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white h-12 text-base font-semibold"
              >
                {quickStart.isPending ? (
                  <>
                    <Dumbbell className="mr-2 h-5 w-5 animate-spin" />
                    Starting...
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
            <div className="text-center py-8">
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

          <div className="flex items-center gap-2 justify-center pt-2">
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
