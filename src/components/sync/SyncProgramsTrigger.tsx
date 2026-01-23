"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useSyncPrograms } from "@/hooks/useSyncPrograms";
import { useOnlineStatus } from "@/hooks/use-online-status";

/**
 * Automatically syncs programs on login and when coming online.
 */
export function SyncProgramsTrigger() {
  const { data: session } = useSession();
  const { syncPrograms, isSyncing } = useSyncPrograms();
  const { isOnline } = useOnlineStatus();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!session?.user?.id || !isOnline || isSyncing || hasSyncedRef.current) return;
    hasSyncedRef.current = true;

    void syncPrograms({ force: true }).catch((error) => {
      console.error("Program sync failed:", error);
      toast.error("Failed to sync programs. Try again later.", {
        duration: 4000,
      });
      hasSyncedRef.current = false;
    });
  }, [session?.user?.id, isOnline, isSyncing, syncPrograms]);

  useEffect(() => {
    if (!session?.user?.id) {
      hasSyncedRef.current = false;
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (!isOnline) {
      hasSyncedRef.current = false;
    }
  }, [isOnline]);

  return null;
}
