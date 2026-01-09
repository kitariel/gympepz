"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Play, BarChart3, Target, Scale, Calendar } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { WorkoutRestWarning } from "@/components/workout-rest-warning";

interface QuickActionsProps {
  activePlanId?: string;
}

export function QuickActions({ activePlanId }: QuickActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  
  // Check if Analytics tab is active
  const isAnalyticsActive = pathname?.startsWith("/portal/log") && searchParams?.get("tab") === "analytics";

  const [showRestDayDialog, setShowRestDayDialog] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  // Pass day based on local timezone to avoid UTC timezone issues
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ] as const;
  const localDayName = dayNames[new Date().getDay()]!;

  const todaysWorkout = api.plan.getTodaysWorkout.useQuery(
    { userId, day: localDayName },
    {
      enabled: !!userId && !!activePlanId,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
  );
  const activeWorkout = api.workoutLog.getActiveWorkout.useQuery(
    { userId },
    { enabled: !!userId },
  );
  const recentWorkoutCheck = api.workoutLog.checkRecentWorkout.useQuery(
    { userId, hoursBack: 6 },
    { enabled: !!userId },
  );

  const utils = api.useUtils();
  const toggleRestDay = api.plan.toggleRestDay.useMutation({
    onSuccess: () => {
      // Invalidate getTodaysWorkout query to ensure UI updates
      if (userId) {
        void utils.plan.getTodaysWorkout.invalidate({
          userId,
          day: localDayName,
        });
      }
    },
  });
  const quickStart = api.workoutLog.quickStart.useMutation({
    onSuccess: (log) => router.push(`/portal/log/workout/${log.id}`),
  });

  const handleStartWorkout = () => {
    if (!userId) {
      router.push("/portal/log");
      return;
    }

    if (!activePlanId) {
      router.push("/portal/log");
      return;
    }

    // Check if there's already an active workout - redirect to it
    if (activeWorkout.data && !activeWorkout.data.completed) {
      router.push(`/portal/log/workout/${activeWorkout.data.id}`);
      return;
    }

    const todayWorkout = todaysWorkout.data?.todayWorkout;
    const isRestDay = todayWorkout?.isRestDay ?? false;
    const hasExercises =
      todayWorkout?.exercises && todayWorkout.exercises.length > 0;

    // Priority: 1. Rest Day (if marked as rest day, show dialog), 2. Exercises, 3. No workout
    if (isRestDay) {
      // It's a rest day - show dialog
      setShowRestDayDialog(true);
      return;
    }

    // If there are exercises, allow starting
    if (hasExercises) {
      // Check if there's a recent completed workout
      if (recentWorkoutCheck.data?.hasRecentWorkout) {
        setShowWarningDialog(true);
        return;
      }
      quickStart.mutate({ userId });
      return;
    }

    // No exercises and not a rest day - show dialog
    if (todayWorkout) {
      setShowRestDayDialog(true);
      return;
    }

    // No workout scheduled - proceed anyway
    quickStart.mutate({ userId });
  };

  const handleRestDayChoice = async (action: "skip" | "add" | "mark") => {
    setShowRestDayDialog(false);

    if (action === "skip") {
      // User confirms it's a rest day - just close
      return;
    } else if (action === "mark") {
      // User wants to mark today as rest day
      if (todaysWorkout.data?.todayWorkout?.id) {
        await toggleRestDay.mutateAsync({
          id: todaysWorkout.data.todayWorkout.id,
        });
        // Query will be invalidated automatically by the mutation's onSuccess
      }
      return;
    } else {
      // User wants to add exercises - redirect to plan editor
      if (activePlanId) {
        router.push(`/portal/plans/${activePlanId}`);
      }
    }
  };

  const handleConfirmStart = () => {
    setShowWarningDialog(false);
    if (activePlanId && userId) {
      quickStart.mutate({ userId });
    } else {
      router.push("/portal/log");
    }
  };

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel className="text-muted-foreground px-4 py-2 text-xs font-medium">
        Actions
      </SidebarGroupLabel>
      <SidebarGroupContent className="grid grid-cols-2 gap-2 px-3">
        {(() => {
          const todayWorkout = todaysWorkout.data?.todayWorkout;
          const exercises = todayWorkout?.exercises;
          const hasExercises = exercises && exercises.length > 0;
          const isRestDay = todayWorkout?.isRestDay ?? false;

          // Determine button text and icon
          // Priority: 1. Rest Day status (if marked as rest day, always show Rest Day), 2. Exercises, 3. No workout
          const getButtonContent = () => {
            if (quickStart.isPending) {
              return {
                icon: (
                  <Play className="mr-2 h-4 w-4 animate-spin fill-current" />
                ),
                text: "Starting...",
              };
            }

            // Priority 1: Check if planDay is marked as rest day (rest day takes priority over exercises)
            if (isRestDay) {
              return {
                icon: <Calendar className="mr-2 h-4 w-4" />,
                text: "Rest Day",
              };
            }

            // Priority 2: Check if there are exercises
            if (hasExercises) {
              return {
                icon: <Play className="mr-2 h-4 w-4 fill-current" />,
                text: "Start Workout",
              };
            }

            // Priority 3: No exercises and not a rest day - show based on whether workout exists
            if (todayWorkout) {
              return {
                icon: <Play className="mr-2 h-4 w-4 fill-current" />,
                text: "No Exercises",
              };
            }

            // No workout scheduled
            return {
              icon: <Play className="mr-2 h-4 w-4 fill-current" />,
              text: "Start Workout",
            };
          };

          const buttonContent = getButtonContent();

          return (
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 col-span-2 w-full shadow-sm"
              onClick={handleStartWorkout}
              disabled={quickStart.isPending}
            >
              {buttonContent.icon}
              {buttonContent.text}
            </Button>
          );
        })()}

        <Button
          variant="outline"
          size="sm"
          className={`h-8 justify-start text-xs ${
            isAnalyticsActive
              ? "bg-primary/10 border-primary/50 text-primary hover:bg-primary/20"
              : ""
          }`}
          onClick={() => router.push("/portal/log?tab=analytics")}
        >
          <BarChart3
            className={`mr-2 h-3.5 w-3.5 ${
              isAnalyticsActive
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          />
          Analytics
        </Button>

        <Button
          variant="outline"
          size="sm"
          className={`h-8 justify-start text-xs ${
            pathname?.startsWith("/portal/plans")
              ? "bg-primary/10 border-primary/50 text-primary hover:bg-primary/20"
              : ""
          }`}
          onClick={() => router.push("/portal/plans")}
        >
          <Target
            className={`mr-2 h-3.5 w-3.5 ${
              pathname?.startsWith("/portal/plans")
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          />
          Plans
        </Button>
      </SidebarGroupContent>

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

          <DialogFooter className="mt-4 flex-col gap-2">
            {todaysWorkout.data?.todayWorkout?.isRestDay ? (
              <Button
                variant="default"
                onClick={() => handleRestDayChoice("skip")}
                className="w-full"
              >
                Got It
              </Button>
            ) : (
              <>
                <div className="flex w-full flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={() => handleRestDayChoice("skip")}
                    className="flex-1"
                  >
                    Skip for Now
                  </Button>
                  <Button
                    onClick={() => handleRestDayChoice("add")}
                    className="flex-1"
                  >
                    Add Exercises
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleRestDayChoice("mark")}
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
    </SidebarGroup>
  );
}
