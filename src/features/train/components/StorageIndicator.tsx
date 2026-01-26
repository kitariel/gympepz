"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { activityStorage } from "@/lib/storage/activityStorage";
import { readOfflineWorkoutLogQueue, readWeeklyPlanSnapshot } from "@/lib/guest/storage";
import { clearLocalStorageAll } from "@/lib/storage/clearLocalStorage";
import { useTrainMode } from "@/features/train/context/TrainModeContext";

type StorageState = {
  pendingCount: number;
  hasPlan: boolean;
};

function getGuestPendingCount() {
  const queue = readOfflineWorkoutLogQueue();
  return queue.logs.filter((log) => !log.synced).length;
}

export function StorageIndicator() {
  const { data: session } = useSession();
  const { isOffline, isSyncing, goOnline } = useTrainMode();
  const isGuest = !session?.user?.id;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [storageState, setStorageState] = useState<StorageState>({
    pendingCount: 0,
    hasPlan: false,
  });

  const refresh = useCallback(() => {
    if (typeof window === "undefined") return;

    if (isGuest) {
      setStorageState({
        pendingCount: getGuestPendingCount(),
        hasPlan: Boolean(readWeeklyPlanSnapshot()),
      });
    } else {
      setStorageState({
        pendingCount: activityStorage.listPending().length,
        hasPlan: true,
      });
    }
  }, [isGuest]);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("storage", handler);
    window.addEventListener("workout-storage-changed", handler as EventListener);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("workout-storage-changed", handler as EventListener);
    };
  }, [refresh]);

  const statusLabel = useMemo(() => {
    if (isGuest) return "Guest • Local";
    if (isOffline) return "Offline • Local";
    return "Synced";
  }, [isGuest, isOffline]);

  const pendingLabel =
    storageState.pendingCount > 0 ? `${storageState.pendingCount} pending` : null;

  const handleClear = () => {
    clearLocalStorageAll();
    refresh();
    setDialogOpen(false);
  };

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-card px-3 py-2 text-sm"
      data-testid="storage-indicator"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{statusLabel}</Badge>
        {pendingLabel ? <Badge variant="outline">{pendingLabel}</Badge> : null}
        {isGuest && !storageState.hasPlan ? (
          <span className="text-muted-foreground text-xs">
            No local plan yet
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isGuest ? (
          <Button asChild size="sm" className="h-8" data-testid="storage-sync-cta">
            <Link href="/login">Sync & back up</Link>
          </Button>
        ) : isOffline ? (
          <Button
            size="sm"
            className="h-8"
            onClick={() => void goOnline()}
            disabled={isSyncing}
            data-testid="storage-sync-now"
          >
            {isSyncing ? "Syncing..." : "Sync now"}
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() => setDialogOpen(true)}
          data-testid="storage-clear"
        >
          Clear local data
        </Button>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear local training data?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes plans, drafts, and offline logs from this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="storage-clear-cancel">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClear}
              data-testid="storage-clear-confirm"
            >
              Clear data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
