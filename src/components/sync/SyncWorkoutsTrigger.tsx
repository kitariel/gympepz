"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSyncWorkouts } from "@/hooks/useSyncWorkouts";
import { toast } from "sonner";

/**
 * Automatically syncs offline workouts when user is authenticated.
 * Runs once per session when user enters portal or logs in.
 */
export function SyncWorkoutsTrigger() {
  const { data: session } = useSession();
  const { syncOfflineWorkouts, hasUnsyncedWorkouts, unsyncedCount, isSyncing } =
    useSyncWorkouts();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    // Only sync if:
    // 1. User is authenticated
    // 2. There are unsynced workouts
    // 3. We haven't already synced in this session
    // 4. Not currently syncing
    if (
      session?.user?.id &&
      hasUnsyncedWorkouts &&
      !hasSyncedRef.current &&
      !isSyncing
    ) {
      hasSyncedRef.current = true;

      // Sync in background (don't block UI)
      void syncOfflineWorkouts()
        .then((result) => {
          if (result.synced > 0) {
            toast.success(
              `Synced ${result.synced} workout${result.synced > 1 ? "s" : ""} from offline mode`,
              { duration: 3000 },
            );
          }
          if (result.failed > 0) {
            toast.warning(
              `${result.failed} workout${result.failed > 1 ? "s" : ""} failed to sync`,
              { duration: 4000 },
            );
          }
        })
        .catch((error) => {
          console.error("Sync failed:", error);
          toast.error("Failed to sync workouts. Try again later.", {
            duration: 4000,
          });
          // Reset flag so user can retry
          hasSyncedRef.current = false;
        });
    }
  }, [
    session?.user?.id,
    hasUnsyncedWorkouts,
    isSyncing,
    syncOfflineWorkouts,
  ]);

  // Reset sync flag when user logs out
  useEffect(() => {
    if (!session?.user?.id) {
      hasSyncedRef.current = false;
    }
  }, [session?.user?.id]);

  // This component doesn't render anything
  return null;
}
