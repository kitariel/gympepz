"use client";

import { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useOnlineStatus } from "@/hooks/use-online-status";
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

// Poll for lock status every 10 seconds
const STATUS_POLL_INTERVAL_MS = 10_000;

function formatTimeAgo(isoString: string): string {
  const startedAt = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - startedAt.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes === 1) return "1 minute ago";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return "1 hour ago";
  return `${diffHours} hours ago`;
}

export function ActiveWorkoutConflictPrompt() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const { isOnline } = useOnlineStatus();
  const router = useRouter();

  const deviceId = useMemo(() => getDeviceId(), []);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const [dismissed, setDismissed] = useState(false);
  const [isTakingOver, setIsTakingOver] = useState(false);

  const statusQuery = api.workoutLock.getStatus.useQuery(
    { deviceId },
    {
      enabled: Boolean(userId) && isOnline,
      refetchInterval: STATUS_POLL_INTERVAL_MS,
    }
  );

  const takeoverMutation = api.workoutLock.takeover.useMutation();

  const lockData = statusQuery.data;

  // Fetch device info for the device that has the lock
  const otherDeviceId = lockData?.hasLock && !lockData.isOwner ? lockData.deviceId : null;
  const deviceInfoQuery = api.device.getByDeviceId.useQuery(
    { deviceId: otherDeviceId ?? "" },
    { enabled: Boolean(otherDeviceId) }
  );
  const otherDeviceName = deviceInfoQuery.data?.displayName ?? "another device";

  // Show modal if:
  // 1. There's an active lock
  // 2. We don't own it
  // 3. It's not stale (stale locks are auto-recovered)
  // 4. User hasn't dismissed
  const show =
    lockData?.hasLock === true &&
    !lockData.isOwner &&
    !lockData.isStale &&
    Boolean(userId) &&
    !dismissed;

  // Reset dismissed state when lock changes (e.g., other device releases)
  useEffect(() => {
    if (!lockData?.hasLock || (lockData.hasLock && lockData.isOwner)) {
      setDismissed(false);
    }
  }, [lockData]);

  if (!show || lockData?.hasLock !== true) return null;

  const handleTakeover = async () => {
    setIsTakingOver(true);
    try {
      const result = await takeoverMutation.mutateAsync({
        deviceId,
        sessionId,
        programName: lockData.programName ?? undefined,
        dayLabel: lockData.dayLabel ?? undefined,
      });

      if (result.status === "taken_over" || result.status === "already_owned") {
        // Refetch status to update UI
        await statusQuery.refetch();
        router.push("/train/log");
      }
    } catch (error) {
      console.error("[ActiveWorkoutConflictPrompt] Takeover failed:", error);
    } finally {
      setIsTakingOver(false);
    }
  };

  const descriptionParts = [
    lockData.programName ? `Program: ${lockData.programName}` : null,
    lockData.dayLabel ? `Day: ${lockData.dayLabel}` : null,
  ].filter(Boolean);

  const timeAgo = formatTimeAgo(lockData.startedAt);

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Workout active on {otherDeviceName}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              Started {timeAgo} on {otherDeviceName}.
              {descriptionParts.length > 0 && (
                <span className="block text-muted-foreground mt-1">
                  {descriptionParts.join(" • ")}
                </span>
              )}
            </span>
            <span className="block mt-2">
              To continue here, take over and {otherDeviceName} will stop.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => setDismissed(true)}
            disabled={isTakingOver}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTakeover}
            disabled={isTakingOver}
          >
            {isTakingOver ? "Taking over..." : "Take over"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
