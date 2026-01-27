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
import { readOfflineWorkoutLogQueue } from "@/lib/guest/storage";
import { clearLocalStorageAll } from "@/lib/storage/clearLocalStorage";
import { useTrainMode } from "@/features/train/context/TrainModeContext";

type StorageState = {
  pendingCount: number;
  totalCount: number;
};

function getGuestPendingCount() {
  const queue = readOfflineWorkoutLogQueue();
  return queue.logs.filter((log) => !log.synced).length;
}

function getGuestTotalCount() {
  const queue = readOfflineWorkoutLogQueue();
  return queue.logs.length;
}

function getGuestStorageBytes() {
  const queue = readOfflineWorkoutLogQueue();
  const payload = JSON.stringify(queue);
  if (typeof TextEncoder === "undefined") {
    return payload.length;
  }
  return new TextEncoder().encode(payload).length;
}

export function StorageIndicator() {
  const { data: session } = useSession();
  const { isOffline, isSyncing, goOnline } = useTrainMode();
  const isGuest = !session?.user?.id;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [storageState, setStorageState] = useState<StorageState>({
    pendingCount: 0,
    totalCount: 0,
  });

  const refresh = useCallback(() => {
    if (typeof window === "undefined") return;

    if (isGuest) {
      setStorageState({
        pendingCount: getGuestPendingCount(),
        totalCount: getGuestTotalCount(),
      });
    } else {
      setStorageState({
        pendingCount: activityStorage.listPending().length,
        totalCount: 0,
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

  const guestBackupPercent = useMemo(() => {
    if (!isGuest) return null;
    if (storageState.totalCount === 0) return 0;
    const syncedCount = storageState.totalCount - storageState.pendingCount;
    return Math.max(0, Math.min(100, Math.round((syncedCount / storageState.totalCount) * 100)));
  }, [isGuest, storageState.pendingCount, storageState.totalCount]);

  const guestStoragePercent = useMemo(() => {
    if (!isGuest) return null;
    const capBytes = 10 * 1024 * 1024;
    const usedBytes = getGuestStorageBytes();
    return Math.max(0, Math.min(100, Math.round((usedBytes / capBytes) * 100)));
  }, [isGuest, storageState.pendingCount, storageState.totalCount]);

  const handleClear = () => {
    clearLocalStorageAll();
    refresh();
    setDialogOpen(false);
  };

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-card px-2.5 py-2 text-xs"
      data-testid="storage-indicator"
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Badge variant="secondary">{statusLabel}</Badge>
        {pendingLabel ? <Badge variant="outline">{pendingLabel}</Badge> : null}
        {isGuest ? (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>Local</span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${guestStoragePercent}%` }}
                aria-hidden="true"
              />
            </div>
            <span className="text-foreground/80">{guestStoragePercent}%</span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isGuest ? (
          <Button asChild size="sm" className="h-7 px-2" data-testid="storage-sync-cta">
            <Link href="/login">Sync & back up</Link>
          </Button>
        ) : isOffline ? (
          <Button
            size="sm"
            className="h-7 px-2"
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
          className="h-7 px-2"
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
