"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Play, BarChart3, Target, Loader2 } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { api } from "@/trpc/react";
import { WorkoutRestWarning } from "@/components/workout-rest-warning";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useTrainPrefs } from "@/hooks/useTrainPrefs";
import { getDayNumberForToday } from "@/features/train/domain/workoutSessionState";
import { cn } from "@/lib/utils";

export function QuickActions() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  const isAnalyticsActive = pathname?.startsWith("/portal/train/history");
  const isTemplatesActive = pathname?.startsWith("/portal/train/templates");

  const [showWarningDialog, setShowWarningDialog] = useState(false);

  // Use local draft state for accurate active workout detection
  const { draft, hydrated: draftHydrated } = useWorkoutDraft();
  const { activeProgram } = useActiveProgram();
  const { programDayMode } = useTrainPrefs();
  const today = getDayNumberForToday();

  // Database query for recent workout check (for rest warning)
  const recentWorkoutCheck = api.workoutLog.checkRecentWorkout.useQuery(
    { userId, hoursBack: 6 },
    { enabled: !!userId },
  );

  const quickStart = api.workoutLog.quickStart.useMutation({
    onSuccess: () => router.push("/portal/train/log"),
  });

  // Check if there's an active local draft (not completed)
  const draftProgramId = draft?.programRef?.id ?? draft?.templateId ?? null;
  const matchesActiveProgram = activeProgram?.templateId
    ? draftProgramId === activeProgram.templateId
    : true;
  const hasActiveWorkout = draftHydrated && draft && !draft.completed && matchesActiveProgram;
  const isScheduledToday = activeProgram
    ? activeProgram.plan.days.some((day) => day.day === today && !day.isRestDay && day.items.length > 0)
    : true;
  const isRestDay = Boolean(activeProgram) && programDayMode === "auto" && !isScheduledToday;

  const handleStartWorkout = () => {
    if (!userId) {
      router.push("/portal/train");
      return;
    }

    // If there's an active local draft, resume it
    if (hasActiveWorkout) {
      router.push("/portal/train/log");
      return;
    }

    if (isRestDay) {
      router.push("/portal/train/overview");
      return;
    }

    if (recentWorkoutCheck.data?.hasRecentWorkout) {
      setShowWarningDialog(true);
      return;
    }
    quickStart.mutate({ userId });
  };

  const handleConfirmStart = () => {
    setShowWarningDialog(false);
    quickStart.mutate({ userId });
  };

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupContent className="space-y-2 px-4">
        {/* Primary Action - Start Workout */}
        <Button
          className="w-full h-11 text-sm font-semibold"
          onClick={handleStartWorkout}
          disabled={quickStart.isPending}
        >
          {quickStart.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : hasActiveWorkout ? (
            <>
              <Play className="mr-2 h-4 w-4 fill-current" />
              Resume Workout
            </>
          ) : isRestDay ? (
            <>
              <Play className="mr-2 h-4 w-4 fill-current" />
              View Next Workout
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4 fill-current" />
              Start Workout
            </>
          )}
        </Button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 text-xs font-medium transition-all",
              isAnalyticsActive &&
                "bg-primary/10 border-primary/50 text-primary hover:bg-primary/20"
            )}
            onClick={() => router.push("/portal/train/history")}
          >
            <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
            Analytics
          </Button>

          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 text-xs font-medium transition-all",
              isTemplatesActive &&
                "bg-primary/10 border-primary/50 text-primary hover:bg-primary/20"
            )}
            onClick={() => router.push("/portal/train/templates")}
          >
            <Target className="mr-1.5 h-3.5 w-3.5" />
            Templates
          </Button>
        </div>
      </SidebarGroupContent>

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
