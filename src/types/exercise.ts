/**
 * Shared types for Exercise entities
 */

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment?: string | null;
  difficulty?: string | null;
  category?: string | null;
  description?: string | null;
  howTo?: string | null;
  imageUrl?: string | null;
  youtubeVideo?: string | null;
  youtubeVideoIds?: string[];
}

/**
 * Exercise with optional computed properties
 */
export type ExerciseWithStats = Exercise & {
  isFavorite?: boolean;
  lastUsed?: Date;
  prWeight?: number;
  totalSets?: number;
};
