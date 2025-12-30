"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Play, BarChart3, Target, Scale } from "lucide-react";
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";

interface QuickActionsProps {
  activePlanId?: string;
}

export function QuickActions({ activePlanId }: QuickActionsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  const [showRestDayDialog, setShowRestDayDialog] = useState(false);

  const todaysWorkout = api.plan.getTodaysWorkout.useQuery(
    { userId },
    { enabled: !!userId && !!activePlanId },
  );
  const activeWorkout = api.workoutLog.getActiveWorkout.useQuery(
    { userId },
    { enabled: !!userId },
  );
  const recentWorkoutCheck = api.workoutLog.checkRecentWorkout.useQuery(
    { userId, hoursBack: 6 },
    { enabled: !!userId },
  );
  
  const toggleRestDay = api.plan.toggleRestDay.useMutation();
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

    // Check if today is a rest day first
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
      // For now, just proceed - or you can add warning dialog here if needed
      quickStart.mutate({ userId });
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
      if (activePlanId) {
        router.push(`/portal/plans/${activePlanId}`);
      }
    }
  };

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4 py-2">
        Actions
      </SidebarGroupLabel>
      <SidebarGroupContent className="px-3 gap-2 grid grid-cols-2">
        <Button
          className="w-full col-span-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          onClick={handleStartWorkout}
        >
          <Play className="h-4 w-4 mr-2 fill-current" />
          Start Workout
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs justify-start"
          onClick={() => router.push("/portal/log?tab=analytics")}
        >
          <BarChart3 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
          Analytics
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs justify-start"
          onClick={() => router.push("/portal/plans")}
        >
          <Target className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
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
    </SidebarGroup>
  );
}
