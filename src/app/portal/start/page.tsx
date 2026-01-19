"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { LoadingView } from "./_components/loading-view";
import { NoPlanView } from "./_components/no-plan-view";
import { HasPlanView } from "./_components/has-plan-view";
import { RestDayDialog } from "./_components/rest-day-dialog";
import { WorkoutRestWarning } from "@/components/workout-rest-warning";
import { useStartWorkout } from "./_hooks/use-start-workout";
import { useWorkoutStartHandlers } from "./_hooks/use-workout-start-handlers";
import { resolveAppMode } from "@/lib/app-mode";
import { GuestStartPage } from "@/app/portal/_guest/guest-start-page";

export default function StartWorkoutPage() {
  const { data: session } = useSession();
  const mode = resolveAppMode(session);

  if (mode === "guest") {
    return <GuestStartPage />;
  }

  const userId = session?.user?.id ?? "";
  return <AuthenticatedStartWorkoutPage userId={userId} />;
}

function AuthenticatedStartWorkoutPage({ userId }: { userId: string }) {
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showRestDayDialog, setShowRestDayDialog] = useState(false);

  // Custom hooks for data fetching and business logic
  const workoutHooks = useStartWorkout(userId);
  const { todaysWorkout, utils } = workoutHooks;

  // Event handlers
  const handlers = useWorkoutStartHandlers({
    userId,
    hooks: workoutHooks,
    setShowWarningDialog,
    setShowRestDayDialog,
  });

  // Refetch today's workout when component mounts or when returning to page
  useEffect(() => {
    if (userId) {
      const handleFocus = () => {
        void utils.plan.getTodaysWorkout.invalidate({ userId });
      };
      window.addEventListener("focus", handleFocus);
      return () => window.removeEventListener("focus", handleFocus);
    }
  }, [userId, utils]);

  // Loading state
  if (todaysWorkout.isLoading) {
    return <LoadingView />;
  }

  const { hasPlan, plan, todayWorkout } = todaysWorkout.data ?? {};

  // No plan - show plan creation options
  if (!hasPlan || !plan) {
    return (
      <NoPlanView
        userId={userId}
        onPlanCreated={async () => {
          await utils.plan.getTodaysWorkout.invalidate({ userId });
          await todaysWorkout.refetch();
        }}
      />
    );
  }

  // Has plan - show today's workout
  return (
    <>
      <HasPlanView
        plan={plan}
        todayWorkout={todayWorkout ?? null}
        onStartWorkout={handlers.handleStartWorkout}
        isStarting={workoutHooks.quickStart.isPending}
      />

      {/* Rest Day / No Exercises Dialog */}
      <RestDayDialog
        open={showRestDayDialog}
        onOpenChange={setShowRestDayDialog}
        onAction={handlers.handleRestDayChoice}
        isRestDay={todaysWorkout.data?.todayWorkout?.isRestDay ?? false}
        workoutTitle={todaysWorkout.data?.todayWorkout?.title}
      />

      {/* Rest Warning Dialog */}
      <WorkoutRestWarning
        open={showWarningDialog}
        onOpenChange={setShowWarningDialog}
        onConfirm={handlers.handleConfirmStart}
        onCancel={() => setShowWarningDialog(false)}
        recentWorkout={workoutHooks.recentWorkoutCheck.data?.workout ?? null}
      />
    </>
  );
}
