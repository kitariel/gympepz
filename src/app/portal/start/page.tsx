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
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { QuickPlanWizard } from "./_components/quick-plan-wizard";
import { WorkoutRestWarning } from "@/components/workout-rest-warning";

export default function StartWorkoutPage() {
  const { data: session } = useSession();
  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);
  const router = useRouter();
  const [showPlanChoices, setShowPlanChoices] = useState(false);
  const [showQuickWizard, setShowQuickWizard] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  // Get today's workout
  const todaysWorkout = api.plan.getTodaysWorkout.useQuery(
    { userId },
    { enabled: !!userId }
  );

  // Check for recent completed workout
  const recentWorkoutCheck = api.workoutLog.checkRecentWorkout.useQuery(
    { userId, hoursBack: 6 },
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
    
    // Check if there's a recent completed workout
    if (recentWorkoutCheck.data?.hasRecentWorkout) {
      setShowWarningDialog(true);
      return;
    }
    
    // No recent workout, start immediately
    quickStart.mutate({ userId });
  };

  const handleConfirmStart = () => {
    setShowWarningDialog(false);
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
          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-blue-500/50 group"
              onClick={() => setShowQuickWizard(true)}
            >
              <CardHeader className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform duration-200">
                    <Dumbbell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Manual Builder</CardTitle>
                    <CardDescription className="mt-1">
                      Build your workout plan step by step
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Select day and body part (Push/Pull/Legs)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Choose exercises from the library</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Set sets, reps, and weight</span>
                  </li>
                </ul>
                <Button 
                  className="w-full h-11 text-base font-semibold"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowQuickWizard(true);
                  }}
                >
                  Start Building
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-purple-500/50 group"
              onClick={() => router.push("/portal/ai-planner")}
            >
              <CardHeader className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform duration-200">
                    <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">AI Planner</CardTitle>
                    <CardDescription className="mt-1">
                      Let AI create a personalized workout plan for you
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span>Select your fitness goals</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span>Choose experience level and equipment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span>AI generates your personalized plan</span>
                  </li>
                </ul>
                <Button 
                  className="w-full h-11 text-base font-semibold bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/portal/ai-planner");
                  }}
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
                      {todayWorkout.exercises.map((exercise, idx) => {
                        const isCompleted = completedExercises.has(exercise.id);
                        return (
                          <div
                            key={exercise.id}
                            className={`flex items-center justify-between text-sm py-2 px-2 rounded-lg border-b last:border-0 transition-colors ${
                              isCompleted 
                                ? "bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800" 
                                : "hover:bg-white/70 dark:hover:bg-background/70"
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <button
                                onClick={() => {
                                  const newCompleted = new Set(completedExercises);
                                  if (isCompleted) {
                                    newCompleted.delete(exercise.id);
                                  } else {
                                    newCompleted.add(exercise.id);
                                  }
                                  setCompletedExercises(newCompleted);
                                }}
                                className="shrink-0"
                                aria-label={isCompleted ? "Mark as incomplete" : "Mark as done"}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                ) : (
                                  <Circle className="h-5 w-5 text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors" />
                                )}
                              </button>
                              <span className="text-muted-foreground text-xs w-6 shrink-0">
                                {idx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                                  {exercise.exerciseName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {exercise.muscleGroup}
                                </p>
                              </div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground shrink-0 ml-2">
                              <p>
                                {exercise.sets} sets × {exercise.reps} reps
                              </p>
                              {exercise.weight && (
                                <p>{exercise.weight} kg</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {completedExercises.size > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-center text-muted-foreground">
                            {completedExercises.size} of {todayWorkout.exercises.length} exercises completed
                          </p>
                        </div>
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

      {/* Rest Warning Dialog */}
      <WorkoutRestWarning
        open={showWarningDialog}
        onOpenChange={setShowWarningDialog}
        onConfirm={handleConfirmStart}
        onCancel={() => setShowWarningDialog(false)}
        recentWorkout={recentWorkoutCheck.data?.workout ?? null}
      />
    </div>
  );
}
