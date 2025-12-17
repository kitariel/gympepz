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
      const sets = await ctx.db.workoutSet.findMany({
        where: {
          exerciseId: input.exerciseId,
          workoutLog: {
            userId: input.userId,
            completed: true,
          },
          completed: true,
        },
        include: {
          workoutLog: {
            select: {
              date: true,
              id: true,
            },
          },
        },
        orderBy: {
          workoutLog: {
            date: "desc",
          },
        },
        take: input.limit * 5, // Get more sets to aggregate by workout
      });

      // Group by workout and get best set per workout
      const workoutMap = new Map<
        string,
        {
          date: Date;
          weight: number;
          reps: number;
          volume: number;
          estimated1RM: number;
        }
      >();

      sets.forEach((set) => {
        const workoutId = set.workoutLog.id;
        const weight = set.actualWeight ?? 0;
        const reps = set.actualReps;
        const volume = weight * reps;
        const estimated1RM = weight * (1 + reps / 30); // Epley formula

        const existing = workoutMap.get(workoutId);
        if (!existing || estimated1RM > existing.estimated1RM) {
          workoutMap.set(workoutId, {
            date: set.workoutLog.date,
            weight,
            reps,
            volume,
            estimated1RM,
          });
        }
      });

      const progress = Array.from(workoutMap.values())
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(-input.limit);

      return progress;
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
      // Get the heaviest set for this exercise
      const bestSet = await ctx.db.workoutSet.findFirst({
        where: {
          exerciseId: input.exerciseId,
          workoutLog: {
            userId: input.userId,
            completed: true,
          },
          completed: true,
          actualWeight: { not: null },
        },
        orderBy: [
          { actualWeight: "desc" },
          { actualReps: "desc" },
        ],
        include: {
          workoutLog: {
            select: { date: true },
          },
        },
      });

      if (!bestSet || !bestSet.actualWeight) {
        return {
          estimated1RM: 0,
          weight: 0,
          reps: 0,
          date: null,
        };
      }

      const estimated1RM = bestSet.actualWeight * (1 + bestSet.actualReps / 30);

      return {
        estimated1RM: Math.round(estimated1RM * 10) / 10,
        weight: bestSet.actualWeight,
        reps: bestSet.actualReps,
        date: bestSet.workoutLog.date,
      };
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
      return ctx.db.exercisePR.findMany({
        where: { userId: input.userId },
        include: {
          exercise: true,
          workoutLog: {
            select: { date: true },
          },
        },
        orderBy: { date: "desc" },
        take: input.limit,
      });
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
      const now = new Date();
      const startDate = new Date();

      if (input.period === "week") {
        startDate.setDate(now.getDate() - 7);
      } else {
        startDate.setMonth(now.getMonth() - 1);
      }

      const sets = await ctx.db.workoutSet.findMany({
        where: {
          workoutLog: {
            userId: input.userId,
            date: { gte: startDate },
            completed: true,
          },
          completed: true,
        },
        include: {
          exercise: {
            select: {
              muscleGroup: true,
            },
          },
        },
      });

      const volumeByMuscleGroup: Record<string, number> = {};

      sets.forEach((set) => {
        const muscle = set.exercise.muscleGroup;
        const volume = (set.actualWeight ?? 0) * set.actualReps;
        volumeByMuscleGroup[muscle] =
          (volumeByMuscleGroup[muscle] ?? 0) + volume;
      });

      return Object.entries(volumeByMuscleGroup).map(([muscle, volume]) => ({
        muscle,
        volume: Math.round(volume),
      }));
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
