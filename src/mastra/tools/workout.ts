import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { db } from "@/server/db";

export const listExercisesTool = createTool({
  id: "list-exercises",
  description: "List exercises filtered by muscle group, equipment, and difficulty",
  inputSchema: z.object({
    muscleGroup: z.string().optional(),
    equipment: z.string().optional(),
    difficulty: z.string().optional(),
    max: z.number().min(1).max(50).default(10).optional(),
    limit: z.number().min(1).max(50).optional(),
  }),
  outputSchema: z.object({
    exercises: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        muscleGroup: z.string(),
        equipment: z.string().nullable(),
        difficulty: z.string().nullable(),
        category: z.string().nullable(),
      }),
    ),
    count: z.number(),
  }),
  execute: async ({ context }) => {
    const mg = context.muscleGroup?.trim();
    const eq = context.equipment?.trim();
    const df = context.difficulty?.trim();
    const take = context.limit ?? context.max ?? 10;
    const where: Record<string, unknown> = {};
    if (mg) Object.assign(where, { muscleGroup: { contains: mg, mode: "insensitive" } });
    if (eq) Object.assign(where, { equipment: { contains: eq, mode: "insensitive" } });
    if (df) Object.assign(where, { difficulty: { equals: df } });
    const rows = await db.exercise.findMany({ where, orderBy: { name: "asc" }, take });
    const exercises = rows.map((e) => ({
      id: e.id,
      name: e.name,
      muscleGroup: e.muscleGroup,
      equipment: e.equipment ?? null,
      difficulty: e.difficulty ?? null,
      category: e.category ?? null,
    }));
    return { exercises, count: exercises.length };
  },
});
