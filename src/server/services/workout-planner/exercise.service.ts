import type { PrismaClient, Exercise } from "@prisma/client";

export const getExercises = async (
  db: PrismaClient,
  equipment?: "Full Gym" | "Dumbbells" | "Home Setup",
  limit?: number,
): Promise<Exercise[]> => {
  const eqFilter =
    equipment === "Full Gym"
      ? undefined
      : equipment === "Dumbbells"
        ? "Dumbbell"
        : "Bodyweight";

  return await db.exercise.findMany({
    where: eqFilter
      ? { equipment: { contains: eqFilter, mode: "insensitive" } }
      : undefined,
    take: limit,
    orderBy: { name: "asc" },
  });
};
