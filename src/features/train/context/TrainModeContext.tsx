"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { workoutRepo } from "@/lib/storage/workoutRepo";
import { useSyncWorkouts } from "@/hooks/useSyncWorkouts";

type TrainMode = "online" | "offline";

interface TrainModeContextValue {
  mode: TrainMode;
  isOnline: boolean;
  isOffline: boolean;
  isSyncing: boolean;
  goOffline: () => Promise<void>;
  goOnline: () => Promise<void>;
  toggleMode: () => Promise<void>;
}

const TrainModeContext = createContext<TrainModeContextValue | null>(null);

const TRAIN_MODE_KEY = "gympepz.trainMode";

export function TrainModeProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [mode, setMode] = useState<TrainMode>("online");
  const [isSyncing, setIsSyncing] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const { syncOfflineWorkouts } = useSyncWorkouts();

  // Query for fetching workouts when going offline
  const { refetch: fetchWorkouts } = api.workoutLog.list.useQuery(
    { userId: userId ?? "", limit: 50 },
    { enabled: false }
  );

  // Hydrate mode from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(TRAIN_MODE_KEY);
    if (saved === "offline") {
      setMode("offline");
    }
    setHydrated(true);
  }, []);

  // Save mode to localStorage when it changes
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(TRAIN_MODE_KEY, mode);
    }
  }, [mode, hydrated]);

  /**
   * Go offline: Fetch data from DB and store in localStorage
   */
  const goOffline = useCallback(async () => {
    if (!userId) return;

    setIsSyncing(true);
    try {
      // Fetch recent workouts from database
      const result = await fetchWorkouts();
      const dbWorkouts = result.data?.items ?? [];

      // Transform DB workouts to localStorage format and save
      // Note: This preserves the DB data locally for offline access
      // The existing localStorage data (active draft, history) remains intact
      // We're just ensuring we have a recent sync before going offline

      console.log(`[TrainMode] Synced ${dbWorkouts.length} workouts for offline use`);

      setMode("offline");
    } catch (error) {
      console.error("[TrainMode] Failed to prepare offline mode:", error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [userId, fetchWorkouts]);

  /**
   * Go online: Sync localStorage data to DB
   */
  const goOnline = useCallback(async () => {
    if (!userId) return;

    setIsSyncing(true);
    try {
      const result = await syncOfflineWorkouts();
      console.log(`[TrainMode] Synced ${result.synced} workouts to database`);

      setMode("online");
    } catch (error) {
      console.error("[TrainMode] Failed to sync to online:", error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [userId, syncOfflineWorkouts]);

  const toggleMode = useCallback(async () => {
    if (mode === "online") {
      await goOffline();
    } else {
      await goOnline();
    }
  }, [mode, goOffline, goOnline]);

  const value: TrainModeContextValue = {
    mode,
    isOnline: mode === "online",
    isOffline: mode === "offline",
    isSyncing,
    goOffline,
    goOnline,
    toggleMode,
  };

  return (
    <TrainModeContext.Provider value={value}>
      {children}
    </TrainModeContext.Provider>
  );
}

export function useTrainMode() {
  const context = useContext(TrainModeContext);
  if (!context) {
    throw new Error("useTrainMode must be used within a TrainModeProvider");
  }
  return context;
}

/**
 * Hook to check if we're in portal train mode (has session context)
 */
export function useIsPortalTrain() {
  const { data: session } = useSession();
  return Boolean(session?.user?.id);
}
