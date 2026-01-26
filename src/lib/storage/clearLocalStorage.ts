import { STORAGE_KEYS } from "@/lib/storage/keys";
import {
  clearWeeklyPlanSnapshot,
  clearOfflineWorkoutLogQueue,
  clearWorkoutBuilderDraft,
  clearGuestWorkoutSession,
} from "@/lib/guest/storage";

const TRAIN_MODE_KEY = "gympepz.trainMode";

export function clearLocalStorageAll() {
  if (typeof window === "undefined") return;

  clearWeeklyPlanSnapshot();
  clearOfflineWorkoutLogQueue();
  clearWorkoutBuilderDraft();
  clearGuestWorkoutSession();

  Object.values(STORAGE_KEYS).forEach((key) => {
    window.localStorage.removeItem(key);
  });
  window.localStorage.removeItem(TRAIN_MODE_KEY);

  window.dispatchEvent(
    new CustomEvent("workout-storage-changed", { detail: { key: "all" } }),
  );
}
