import { toast } from "sonner";

/**
 * Train feature toast notifications
 * Centralized toast messages for consistent UX
 */
export const trainToast = {
  // Workout actions
  workoutStarted: () => toast.success("Workout started"),
  workoutSaved: () => toast.success("Workout saved"),
  workoutFinished: () => toast.success("Workout complete!"),
  workoutDiscarded: () => toast("Workout discarded"),

  // Set actions
  setCompleted: () => toast.success("Set completed", { duration: 1500 }),
  setDeleted: () => toast("Set removed"),
  goalProgressUpdated: (label: string, extraCount = 0) =>
    toast.success(
      extraCount > 0 ? `Goal updated: ${label} +${extraCount}` : `Goal updated: ${label}`,
      { duration: 2000 },
    ),

  // Program actions
  programActivated: (name: string) => toast.success(`${name} activated`),
  programSaved: () => toast.success("Program saved"),
  programDeleted: () => toast("Program deleted"),

  // History actions
  historyItemDeleted: () => toast("Workout deleted from history"),

  // Errors
  error: (message: string) => toast.error(message),
  saveFailed: () => toast.error("Failed to save. Please try again."),
  loadFailed: () => toast.error("Failed to load data. Please refresh."),
  networkError: () => toast.error("Network error. Check your connection."),

  // Generic
  copied: () => toast.success("Copied!", { duration: 1500 }),
  undo: (message: string, onUndo: () => void) =>
    toast(message, {
      action: {
        label: "Undo",
        onClick: onUndo,
      },
      duration: 5000,
    }),
};
