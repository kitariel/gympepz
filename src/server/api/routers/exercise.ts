import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const exerciseRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z
        .object({
          q: z.string().optional(),
          muscleGroup: z.string().optional(),
          equipment: z.string().optional(),
          difficulty: z.string().optional(),
          take: z.number().min(1).max(1000).optional(),
          skip: z.number().min(0).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const q = input?.q?.trim();
      const mg = input?.muscleGroup?.trim();
      const eq = input?.equipment?.trim();
      const diff = input?.difficulty?.trim();
      const take = input?.take ?? 1000;
      const skip = input?.skip ?? 0;
      const where: Record<string, unknown> = {};
      if (q) {
        Object.assign(where, {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { muscleGroup: { contains: q, mode: "insensitive" } },
            { equipment: { contains: q, mode: "insensitive" } },
          ],
        });
      }
      if (mg) Object.assign(where, { muscleGroup: { contains: mg, mode: "insensitive" } });
      if (eq) Object.assign(where, { equipment: { contains: eq, mode: "insensitive" } });
      if (diff) Object.assign(where, { difficulty: { equals: diff } });
      return ctx.db.exercise.findMany({ where, orderBy: { name: "asc" }, take, skip });
    }),
  count: publicProcedure
    .input(
      z
        .object({
          q: z.string().optional(),
          muscleGroup: z.string().optional(),
          equipment: z.string().optional(),
          difficulty: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const q = input?.q?.trim();
      const mg = input?.muscleGroup?.trim();
      const eq = input?.equipment?.trim();
      const diff = input?.difficulty?.trim();
      const where: Record<string, unknown> = {};
      if (q) {
        Object.assign(where, {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { muscleGroup: { contains: q, mode: "insensitive" } },
            { equipment: { contains: q, mode: "insensitive" } },
          ],
        });
      }
      if (mg) Object.assign(where, { muscleGroup: { contains: mg, mode: "insensitive" } });
      if (eq) Object.assign(where, { equipment: { contains: eq, mode: "insensitive" } });
      if (diff) Object.assign(where, { difficulty: { equals: diff } });
      return ctx.db.exercise.count({ where });
    }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        muscleGroup: z.string().min(1),
        equipment: z.string().optional(),
        difficulty: z.string().optional(),
        description: z.string().optional(),
        howTo: z.string().optional(),
        imageUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const ex = await ctx.db.exercise.create({ data: input });
      return ex;
    }),
  createMany: publicProcedure
    .input(z.object({ items: z.array(z.object({
      name: z.string().min(1),
      muscleGroup: z.string().min(1),
      equipment: z.string().optional(),
      difficulty: z.string().optional(),
      description: z.string().optional(),
      howTo: z.string().optional(),
      imageUrl: z.string().url().optional(),
    })).min(1) }))
    .mutation(async ({ ctx, input }) => {
      const data = input.items.map((i) => ({ ...i }));
      await ctx.db.exercise.createMany({ data });
      return { count: data.length };
    }),
});