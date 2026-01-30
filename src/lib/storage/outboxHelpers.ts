/**
 * Helper functions for adding events to the outbox
 */

import { addEvent, type WorkoutEventPayload } from "./outboxDb";
import type { WorkoutHistoryItem } from "./workoutRepo";
import { getDeviceId } from "@/lib/device-id";

/**
 * Add a completed workout to the outbox for syncing
 */
export async function queueWorkoutForSync(
  workout: WorkoutHistoryItem,
  userId: string
): Promise<void> {
  const deviceId = getDeviceId();

  // Transform workout to outbox payload format
  const payload: WorkoutEventPayload = {
    clientId: workout.id,
    date: workout.date,
    startTime: workout.startedAt,
    endTime: workout.endedAt ?? null,
    completed: workout.completed,
    notes: workout.notes,
    programName: workout.programName,
    programDayLabel: workout.programDayLabel,
    sets: workout.sets.map((set, index) => ({
      exerciseId: set.exerciseId,
      exerciseName: set.exerciseName,
      setNumber: set.setNumber ?? index + 1,
      targetReps: set.targetReps ? parseInt(set.targetReps, 10) : null,
      actualReps: parseInt(set.actualReps, 10) || 0,
      targetWeight: set.targetWeight ? parseFloat(set.targetWeight) : null,
      actualWeight: set.actualWeight ? parseFloat(set.actualWeight) : null,
      rpe: null, // RPE not tracked in current format
      completed: set.completed,
    })),
  };

  await addEvent("workout_logged", userId, deviceId, payload);
}

/**
 * Queue multiple workouts for sync (e.g., during migration)
 */
export async function queueWorkoutsForSync(
  workouts: WorkoutHistoryItem[],
  userId: string
): Promise<void> {
  for (const workout of workouts) {
    await queueWorkoutForSync(workout, userId);
  }
}
