"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { useRouteContext } from "@/hooks/useRouteContext";
import { trainPath } from "@/lib/routes";
import { api } from "@/trpc/react";
import { getDeviceId } from "@/lib/device-id";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/**
 * Detects when this device's workout session has been taken over by another device.
 * Shows a modal prompting the user to go home or view their summary.
 */
export function SessionTakenOverBanner() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const { isOnline } = useOnlineStatus();
  const { draft, discardDraft } = useWorkoutDraft();
  const router = useRouter();
  const pathname = usePathname();
  const routeContext = useRouteContext();

  const deviceId = useMemo(() => getDeviceId(), []);
  const [wasTakenOver, setWasTakenOver] = useState(false);

  const statusQuery = api.workoutLock.getStatus.useQuery(
    { deviceId },
    {
      enabled: Boolean(userId) && isOnline && Boolean(draft) && !draft?.completed,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  const lockData = statusQuery.data;

  // Detect when our lock was taken over
  useEffect(() => {
    // We have an active draft locally
    if (!draft || draft.completed) {
      setWasTakenOver(false);
      return;
    }

    // If there's a lock but we don't own it, we were taken over
    if (lockData?.hasLock && !lockData.isOwner) {
      setWasTakenOver(true);
    }

    // If there's no lock at all, it might have been released
    // (could be by us or by another device after takeover)
  }, [draft, lockData]);

  const handleGoHome = useCallback(() => {
    discardDraft();
    setWasTakenOver(false);
    router.push(trainPath(routeContext));
  }, [discardDraft, router, routeContext]);

  const handleViewSummary = useCallback(() => {
    // Keep the draft data but navigate to a summary view
    // The user can see what they logged before being taken over
    setWasTakenOver(false);
    router.push(trainPath(routeContext, "summary"));
  }, [router, routeContext]);

  const handleTakeBack = useCallback(async () => {
    // User wants to reclaim the session
    setWasTakenOver(false);
    // The ConflictPrompt will handle showing the takeover modal
    // We just need to trigger a status refetch
    await statusQuery.refetch();
  }, [statusQuery]);

  // Only show on workout-related pages
  const isWorkoutPage = pathname?.includes("/train/log") || pathname?.includes("/train/focus");

  if (!wasTakenOver || !isWorkoutPage) return null;

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session taken over on another device</AlertDialogTitle>
          <AlertDialogDescription>
            Your workout session has been moved to another device. This device is now in read-only mode.
            <span className="block mt-2 text-muted-foreground">
              Your logged sets have been saved locally. You can view your progress or go back to the home screen.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={handleGoHome}>
            Go to Home
          </Button>
          <Button variant="outline" onClick={handleViewSummary}>
            View Summary
          </Button>
          <Button onClick={handleTakeBack}>
            Take it back
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
