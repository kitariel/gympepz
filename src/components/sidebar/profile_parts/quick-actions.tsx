"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Play, BarChart3, Target } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { api } from "@/trpc/react";
import { WorkoutRestWarning } from "@/components/workout-rest-warning";

export function QuickActions() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  
  // Check if Analytics tab is active
  const isAnalyticsActive = pathname?.startsWith("/portal/train/history");

  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const activeWorkout = api.workoutLog.getActiveWorkout.useQuery(
    { userId },
    { enabled: !!userId },
  );
  const recentWorkoutCheck = api.workoutLog.checkRecentWorkout.useQuery(
    { userId, hoursBack: 6 },
    { enabled: !!userId },
  );

  const quickStart = api.workoutLog.quickStart.useMutation({
    onSuccess: () => router.push("/portal/train/log"),
  });

  const handleStartWorkout = () => {
    if (!userId) {
      router.push("/portal/train");
      return;
    }

    // Check if there's already an active workout - redirect to it
    if (activeWorkout.data && !activeWorkout.data.completed) {
      router.push("/portal/train/log");
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
      <SidebarGroupLabel className="text-muted-foreground px-4 py-2 text-xs font-medium">
        Actions
      </SidebarGroupLabel>
      <SidebarGroupContent className="grid grid-cols-2 gap-2 px-3">
        {(() => {
          const hasActiveWorkout =
            activeWorkout.data && !activeWorkout.data.completed;
          const buttonContent = quickStart.isPending
            ? {
                icon: (
                  <Play className="mr-2 h-4 w-4 animate-spin fill-current" />
                ),
                text: "Starting...",
              }
            : hasActiveWorkout
              ? {
                  icon: <Play className="mr-2 h-4 w-4 fill-current" />,
                  text: "Resume Workout",
                }
              : {
                  icon: <Play className="mr-2 h-4 w-4 fill-current" />,
                  text: "Start Workout",
                };

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
          onClick={() => router.push("/portal/train/history")}
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
          className="h-8 justify-start text-xs"
          onClick={() => router.push("/portal/train/templates")}
        >
          <Target
            className={`mr-2 h-3.5 w-3.5 ${
              pathname?.startsWith("/portal/train/templates")
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          />
          Templates
        </Button>
      </SidebarGroupContent>

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
