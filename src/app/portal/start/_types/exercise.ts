/**
 * Exercise type definition
 * Matches the structure returned from the exercise router
 */

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment?: string | null;
  category?: string | null;
  difficulty?: string | null;
  description?: string | null;
  howTo?: string | null;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

