/**
 * Utility functions for filtering exercises by body part
 */

import type { BodyPart } from "../../../_types";

export function filterExercisesByBodyPart<T extends { muscleGroup: string }>(
  exercises: T[],
  bodyPart: BodyPart | null,
): T[] {
  if (!bodyPart) return exercises;

  return exercises.filter((ex) => {
    const muscle = ex.muscleGroup.toLowerCase();
    
    if (bodyPart === "Push") {
      // Push: Chest, Shoulders, Triceps
      return (
        muscle.includes("chest") ||
        muscle.includes("shoulder") ||
        muscle.includes("triceps")
      );
    } else if (bodyPart === "Pull") {
      // Pull: Back, Biceps, Rear Delts
      return (
        muscle.includes("back") ||
        muscle.includes("biceps") ||
        muscle.includes("rear") ||
        muscle === "arms" // Arms category might contain biceps
      );
    } else if (bodyPart === "Legs") {
      // Legs: Quads, Hamstrings, Glutes, Calves
      return (
        muscle.includes("leg") ||
        muscle.includes("quad") ||
        muscle.includes("hamstring") ||
        muscle.includes("glute") ||
        muscle.includes("calf") ||
        muscle.includes("thigh")
      );
    }
    
    return true;
  });
}

