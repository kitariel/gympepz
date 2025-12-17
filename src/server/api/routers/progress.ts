import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const progressRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        date: z.date().optional(),
        weight: z.number().optional(),
        bodyFat: z.number().optional(),
        chest: z.number().optional(),
        waist: z.number().optional(),
        hips: z.number().optional(),
        arms: z.number().optional(),
        thighs: z.number().optional(),
        notes: z.string().optional(),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.progressEntry.create({
        data: {
          userId: input.userId,
          date: input.date ?? new Date(),
          weight: input.weight,
          bodyFat: input.bodyFat,
          chest: input.chest,
          waist: input.waist,
          hips: input.hips,
          arms: input.arms,
          thighs: input.thighs,
          notes: input.notes,
          imageUrl: input.imageUrl,
        },
      });
    }),

  list: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.progressEntry.findMany({
        where: { userId: input.userId },
        orderBy: { date: "asc" },
        take: input.limit,
      });
    }),

  latest: publicProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.progressEntry.findFirst({
        where: { userId: input.userId },
        orderBy: { date: "desc" },
      });
    }),
    
  delete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.progressEntry.delete({
        where: { id: input.id },
      });
    }),

  // Get exercise-specific progress
  getExerciseProgress: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        exerciseId: z.string().min(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      // WorkoutSet table doesn't exist yet, return empty array
      return [];
    }),

  // Calculate estimated 1RM for an exercise
  calculate1RM: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        exerciseId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      // WorkoutSet table doesn't exist yet
      return { estimated1RM: 0, weight: 0, reps: 0, date: null };
    }),

  // Get personal records
  getPRs: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      // ExercisePR table doesn't exist yet, return empty array
      // After migration, this will return actual PRs
      return [];
    }),

  // Get volume by muscle group
  getVolumeByMuscleGroup: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        period: z.enum(["week", "month"]).default("week"),
      })
    )
    .query(async ({ ctx, input }) => {
      // WorkoutSet table doesn't exist yet
      return {};
    }),

  // Upload progress photo
  uploadPhoto: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        imageUrl: z.string().min(1),
        date: z.date().optional(),
        weight: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.progressEntry.create({
        data: {
          userId: input.userId,
          date: input.date ?? new Date(),
          imageUrl: input.imageUrl,
          weight: input.weight,
          notes: input.notes,
        },
      });
    }),
});
