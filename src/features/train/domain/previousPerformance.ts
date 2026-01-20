import type { WorkoutHistoryItem } from "@/lib/storage/workoutRepo";

export type PreviousSetPerformance = {
  weight: string | null;
  reps: string;
  date: string; // ISO
  programName: string;
  isSameProgram: boolean;
};

/**
 * Find the most recent performance for a given exercise across all workout history.
 * Returns the last completed set for this exercise name.
 */
export function getPreviousPerformance(input: {
  exerciseName: string;
  history: WorkoutHistoryItem[];
  currentProgramId?: string;
}): PreviousSetPerformance | null {
  const { exerciseName, history, currentProgramId } = input;

  // Sort history by date (most recent first)
  const sortedHistory = history
    .filter((h) => h.completed)
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Find the most recent workout that contains this exercise
  for (const workout of sortedHistory) {
    // Find all sets for this exercise in this workout
    const exerciseSets = workout.sets.filter(
      (set) => set.exerciseName.toLowerCase() === exerciseName.toLowerCase() && set.completed
    );

    if (exerciseSets.length === 0) continue;

    // Take the last completed set (highest set number)
    const lastSet = exerciseSets
      .slice()
      .sort((a, b) => b.setNumber - a.setNumber)[0];

    if (!lastSet) continue;

    const workoutProgramId = workout.programRef?.id ?? workout.templateId;
    const isSameProgram = currentProgramId != null && workoutProgramId === currentProgramId;

    return {
      weight: lastSet.actualWeight,
      reps: lastSet.actualReps,
      date: workout.date,
      programName: workout.programName,
      isSameProgram,
    };
  }

  return null;
}

/**
 * Format a date as relative time (e.g., "3d ago", "1w ago", "2mo ago")
 */
export function formatRelativeDate(isoDate: string, now: Date = new Date()): string {
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}w ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months}mo ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years}y ago`;
}
