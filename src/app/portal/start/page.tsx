"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Sparkles,
  Dumbbell,
  ArrowRight,
  Target,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { QuickPlanWizard } from "./_components/quick-plan-wizard";
import { WorkoutRestWarning } from "@/components/workout-rest-warning";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function StartWorkoutPage() {
  const { data: session } = useSession();
  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);
  const router = useRouter();
  const [showPlanChoices, setShowPlanChoices] = useState(false);
  const [showQuickWizard, setShowQuickWizard] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showRestDayDialog, setShowRestDayDialog] = useState(false);

  // Get today's workout
  const todaysWorkout = api.plan.getTodaysWorkout.useQuery(
    { userId },
    { enabled: !!userId },
  );

  // Check for recent completed workout
  const recentWorkoutCheck = api.workoutLog.checkRecentWorkout.useQuery(
    { userId, hoursBack: 6 },
    { enabled: !!userId },
  );

  const quickStart = api.workoutLog.quickStart.useMutation({
    onSuccess: (log) => router.push(`/portal/log/workout/${log.id}`),
  });

  const toggleRestDay = api.plan.toggleRestDay.useMutation();

  const handleStartWorkout = () => {
    if (!userId) return;

    // Check if today is a rest day
    if (todaysWorkout.data?.todayWorkout?.isRestDay) {
      // It's a rest day - show rest day message
      setShowRestDayDialog(true);
      return;
    }

    // Check if today's workout has exercises
    const hasExercises = todaysWorkout.data?.todayWorkout?.exercises && 
                        todaysWorkout.data.todayWorkout.exercises.length > 0;
    
    if (!hasExercises && todaysWorkout.data?.todayWorkout) {
      // No exercises - show rest day dialog
      setShowRestDayDialog(true);
      return;
    }

    // Check if there's a recent completed workout
    if (recentWorkoutCheck.data?.hasRecentWorkout) {
      setShowWarningDialog(true);
      return;
    }

    quickStart.mutate({ userId });
  };

  const handleRestDayChoice = async (action: 'skip' | 'add' | 'mark') => {
    setShowRestDayDialog(false);
    
    if (action === 'skip') {
      // User confirms it's a rest day - just close the dialog
      return;
    } else if (action === 'mark') {
      // User wants to mark today as rest day
      if (todaysWorkout.data?.todayWorkout?.id) {
        await toggleRestDay.mutateAsync({ id: todaysWorkout.data.todayWorkout.id });
        await todaysWorkout.refetch();
      }
      return;
    } else {
      // User wants to add exercises - redirect to plan editor
      const { hasPlan, plan } = todaysWorkout.data ?? {};
      if (plan) {
        router.push(`/portal/plans/${plan.id}`);
      }
    }
  };

  const handleConfirmStart = () => {
    setShowWarningDialog(false);
    if (userId) quickStart.mutate({ userId });
  };

  // Loading state
  if (todaysWorkout.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Dumbbell className="text-muted-foreground mx-auto mb-4 h-12 w-12 animate-spin" />
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
        <div className="container mx-auto max-w-4xl p-6">
          <div className="mb-6 space-y-2 text-center">
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
      <div className="container mx-auto max-w-4xl space-y-6 p-6">
        <div className="mb-8 space-y-2 text-center">
          <h1 className="text-3xl font-bold">Start Working Out</h1>
          <p className="text-muted-foreground">
            Create a workout plan to get started
          </p>
        </div>

        {!showPlanChoices ? (
          <Card className="border-2 border-dashed">
            <CardContent className="space-y-6 px-6 pt-16 pb-16 text-center">
              <div className="bg-primary/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full">
                <Target className="text-primary h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">
                  No Workout Plan Found
                </h2>
                <p className="text-muted-foreground mx-auto max-w-md text-sm">
                  Create a workout plan to get started. Choose how you&apos;d
                  like to build your plan.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => setShowPlanChoices(true)}
                className="bg-primary hover:bg-primary/90 h-12 text-base"
              >
                Create Workout Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card
              className="hover:border-primary/50 group cursor-pointer border-2 border-transparent transition-all duration-200 hover:shadow-lg"
              onClick={() => setShowQuickWizard(true)}
            >
              <CardHeader className="px-6 pt-6 pb-4">
                <div className="mb-2 flex items-center gap-3">
                  <div className="bg-primary/10 rounded-xl p-3 transition-transform duration-200 group-hover:scale-110">
                    <Dumbbell className="text-primary h-6 w-6" />
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
                <ul className="text-muted-foreground mb-6 space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <span>Select day and body part (Push/Pull/Legs)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <span>Choose exercises from the library</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <span>Set sets, reps, and weight</span>
                  </li>
                </ul>
                <Button
                  className="h-11 w-full text-base font-semibold"
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
              className="hover:border-primary/50 group cursor-pointer border-2 border-transparent transition-all duration-200 hover:shadow-lg"
              onClick={() => router.push("/portal/ai-planner")}
            >
              <CardHeader className="px-6 pt-6 pb-4">
                <div className="mb-2 flex items-center gap-3">
                  <div className="bg-primary/10 rounded-xl p-3 transition-transform duration-200 group-hover:scale-110">
                    <Sparkles className="text-primary h-6 w-6" />
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
                <ul className="text-muted-foreground mb-6 space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <span>Select your fitness goals</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <span>Choose experience level and equipment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <span>AI generates your personalized plan</span>
                  </li>
                </ul>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 w-full text-base font-semibold"
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
                onClick={handleStartWorkout}
                disabled={
                  quickStart.isPending ||
                  todaysWorkout.data?.todayWorkout?.isRestDay ||
                  (todaysWorkout.data?.todayWorkout?.exercises?.length ?? 0) === 0
                }
                className="h-12 w-full bg-gradient-to-br from-teal-600 to-teal-700 text-base font-semibold text-white hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {quickStart.isPending ? (
                  <>
                    <Dumbbell className="mr-2 h-5 w-5 animate-spin" />
                    Starting...
                  </>
                ) : todaysWorkout.data?.todayWorkout?.isRestDay ? (
                  <>
                    <Calendar className="mr-2 h-5 w-5" />
                    Rest Day
                  </>
                ) : (todaysWorkout.data?.todayWorkout?.exercises?.length ?? 0) === 0 ? (
                  <>
                    <Target className="mr-2 h-5 w-5" />
                    No Exercises Scheduled
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

      {/* Rest Day / No Exercises Dialog */}
      <Dialog open={showRestDayDialog} onOpenChange={setShowRestDayDialog}>
        <DialogContent>
          <DialogHeader>
            {todaysWorkout.data?.todayWorkout?.isRestDay ? (
              <>
                <DialogTitle>It&apos;s Your Rest Day Today</DialogTitle>
                <DialogDescription className="pt-2">
                  {todaysWorkout.data.todayWorkout.title
                    ? `Today is scheduled as a rest day for "${todaysWorkout.data.todayWorkout.title}". Take time to recover and let your muscles heal.`
                    : "Today is scheduled as a rest day. Take time to recover and let your muscles heal."}
                </DialogDescription>
              </>
            ) : (
              <>
                <DialogTitle>No Exercises for Today&apos;s Workout</DialogTitle>
                <DialogDescription className="pt-2">
                  {todaysWorkout.data?.todayWorkout?.title
                    ? `Today's workout "${todaysWorkout.data.todayWorkout.title}" doesn't have any exercises yet. Is this a rest day, or would you like to add exercises?`
                    : "Today's workout doesn't have any exercises yet. Is this a rest day, or would you like to add exercises?"}
                </DialogDescription>
              </>
            )}
          </DialogHeader>

          <DialogFooter className="flex-col gap-2 mt-4">
            {todaysWorkout.data?.todayWorkout?.isRestDay ? (
              <Button
                variant="default"
                onClick={() => handleRestDayChoice('skip')}
                className="w-full"
              >
                Got It
              </Button>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={() => handleRestDayChoice('skip')}
                    className="flex-1"
                  >
                    Skip for Now
                  </Button>
                  <Button
                    onClick={() => handleRestDayChoice('add')}
                    className="flex-1"
                  >
                    Add Exercises
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleRestDayChoice('mark')}
                  className="w-full"
                >
                  Mark Today as Rest Day
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
