import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const workoutLogRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        planDayId: z.string().optional(),
        date: z.date().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const log = await ctx.db.workoutLog.create({
        data: {
          userId: input.userId,
          planDayId: input.planDayId,
          date: input.date ?? new Date(),
          notes: input.notes,
        },
      });

      if (input.planDayId) {
        const planDay = await ctx.db.planDay.findUnique({
          where: { id: input.planDayId },
          include: { items: true },
        });

        if (planDay && planDay.items.length > 0) {
          await ctx.db.workoutLogExercise.createMany({
            data: planDay.items.map((item) => ({
              workoutLogId: log.id,
              exerciseId: item.exerciseId,
              sets: item.sets,
              reps: item.reps,
              weight: item.weight,
            })),
          });
        }
      }

      return log;
    }),

  list: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const logs = await ctx.db.workoutLog.findMany({
        where: { userId: input.userId },
        orderBy: { date: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          planDay: true,
          _count: { select: { exercises: true } },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (logs.length > input.limit) {
        const nextItem = logs.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: logs,
        nextCursor,
      };
    }),

  get: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.workoutLog.findUnique({
        where: { id: input.id },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { createdAt: "asc" },
          },
          planDay: true,
        },
      });
    }),

  addExercise: publicProcedure
    .input(
      z.object({
        workoutLogId: z.string().min(1),
        exerciseId: z.string().min(1),
        sets: z.number().min(1),
        reps: z.number().min(0),
        weight: z.number().optional(),
        rpe: z.number().min(1).max(10).optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.workoutLogExercise.create({
        data: {
          workoutLogId: input.workoutLogId,
          exerciseId: input.exerciseId,
          sets: input.sets,
          reps: input.reps,
          weight: input.weight,
          rpe: input.rpe,
          notes: input.notes,
        },
      });
    }),

  updateExercise: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        sets: z.number().optional(),
        reps: z.number().optional(),
        weight: z.number().optional(),
        rpe: z.number().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.workoutLogExercise.update({
        where: { id: input.id },
        data: {
          sets: input.sets,
          reps: input.reps,
          weight: input.weight,
          rpe: input.rpe,
          notes: input.notes,
        },
      });
    }),

  deleteExercise: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.workoutLogExercise.delete({
        where: { id: input.id },
      });
    }),

  complete: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        duration: z.number().optional(),
        notes: z.string().optional(),
        completed: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workout = await ctx.db.workoutLog.update({
        where: { id: input.id },
        data: {
          completed: input.completed ?? true,
          duration: input.duration,
          notes: input.notes,
          endTime: input.completed ? new Date() : undefined,
        },
        include: {
          exercises: true,
        },
      });

      // Volume and streak tracking will be available after migration
      // WorkoutSet and WorkoutStreak tables don't exist yet
      // WorkoutStreak table doesn't exist yet
      // After migration, uncomment this code to enable real-time streak updates

      return workout;
    }),

  // Quick start from active plan
  quickStart: publicProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        include: {
          activePlan: {
            include: {
              days: {
                include: { items: true },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });

      if (!user?.activePlan) {
        throw new Error("No active plan found");
      }

      // Get last workout to determine next day
      const lastLog = await ctx.db.workoutLog.findFirst({
        where: {
          userId: input.userId,
          planDayId: { not: null },
        },
        orderBy: { date: "desc" },
        include: { planDay: true },
      });

      let nextDay = user.activePlan.days[0];

      if (lastLog?.planDay) {
        const lastDayOrder = lastLog.planDay.order;
        const nextDayIndex =
          user.activePlan.days.findIndex((d) => d.order > lastDayOrder) ?? 0;
        nextDay =
          user.activePlan.days[nextDayIndex] ?? user.activePlan.days[0];
      }

      if (!nextDay) {
        throw new Error("No workout day found");
      }

      // Create workout log with exercises
      const log = await ctx.db.workoutLog.create({
        data: {
          userId: input.userId,
          planDayId: nextDay.id,
          date: new Date(),
        },
      });

      // Set tracking will be available after migration
      // WorkoutSet table doesn't exist yet

      return log;
    }),

  // Get workout with history context
  getWithHistory: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        includeLastWorkout: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const workout = await ctx.db.workoutLog.findUnique({
        where: { id: input.id },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { createdAt: "asc" },
          },
          planDay: true,
        },
      });

      if (!workout) return null;

      let lastWorkout = null;
      if (input.includeLastWorkout && workout.planDayId) {
        lastWorkout = await ctx.db.workoutLog.findFirst({
          where: {
            userId: workout.userId,
            planDayId: workout.planDayId,
            id: { not: workout.id },
            completed: true,
          },
          orderBy: { date: "desc" },
          include: {
            exercises: {
              include: { exercise: true },
            },
          },
        });
      }

      return {
        ...workout,
        lastWorkout,
      };
    }),

  // Calendar view
  calendar: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        month: z.number().min(1).max(12),
        year: z.number().min(2020),
      })
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date(input.year, input.month - 1, 1);
      const endDate = new Date(input.year, input.month, 0, 23, 59, 59);

      const logs = await ctx.db.workoutLog.findMany({
        where: {
          userId: input.userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          planDay: true,
          _count: { select: { exercises: true } },
        },
        orderBy: { date: "asc" },
      });

      return logs;
    }),

  // Get streak - Calculate from workouts (WorkoutStreak table doesn't exist yet)
  getStreak: publicProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      // Get recent completed workouts
      const recentLogs = await ctx.db.workoutLog.findMany({
        where: { 
          userId: input.userId,
          completed: true,
        },
        orderBy: { date: "desc" },
        take: 100,
      });

      if (recentLogs.length === 0) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          lastWorkout: null,
        };
      }

      // Calculate current streak
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const workoutDates = recentLogs.map(log => {
        const date = new Date(log.date);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      });

      // Remove duplicates and sort
      const uniqueDates = [...new Set(workoutDates)].sort((a, b) => b - a);

      // Calculate current streak from today
      let expectedDate = today.getTime();
      for (const date of uniqueDates) {
        const diffDays = Math.floor((expectedDate - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0 || diffDays === 1) {
          currentStreak++;
          expectedDate = date - (1000 * 60 * 60 * 24);
        } else {
          break;
        }
      }

      // Calculate longest streak
      tempStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const diffDays = Math.floor((uniqueDates[i - 1] - uniqueDates[i]) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }

      longestStreak = Math.max(longestStreak, currentStreak, tempStreak);

      return {
        currentStreak,
        longestStreak,
        lastWorkout: recentLogs[0]?.date ?? null,
      };
    }),

  // Analytics
  getAnalytics: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        startDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      let startDate = input.startDate ?? new Date();
      
      if (!input.startDate) {
        startDate.setMonth(now.getMonth() - 1);
      }

      const logs = await ctx.db.workoutLog.findMany({
        where: {
          userId: input.userId,
          date: { gte: startDate },
          completed: true,
        },
        include: {
          exercises: {
            include: { exercise: true },
          },
        },
      });

      const totalWorkouts = logs.length;
      
      // Calculate total volume from exercises (estimate)
      let totalVolume = 0;
      const volumeByMuscleGroup: Record<string, number> = {};
      
      logs.forEach((log) => {
        log.exercises?.forEach((exercise) => {
          const muscle = exercise.exercise.muscleGroup;
          const volume = (exercise.weight ?? 0) * exercise.reps * exercise.sets;
          totalVolume += volume;
          volumeByMuscleGroup[muscle] = (volumeByMuscleGroup[muscle] ?? 0) + volume;
        });
      });

      const avgDuration = 
        logs.reduce((sum, log) => sum + (log.duration ?? 0), 0) / totalWorkouts || 0;

      return {
        totalWorkouts,
        totalVolume,
        averageDuration: Math.round(avgDuration),
        volumeByMuscleGroup,
      };
    }),

  // Get total volume for a workout
  getTotalVolume: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const sets = await ctx.db.workoutSet.findMany({
        where: { workoutLogId: input.id },
      });

      const totalVolume = sets.reduce((sum, set) => {
        return sum + (set.actualWeight ?? 0) * set.actualReps;
      }, 0);

      return totalVolume;
    }),

  // Update workout duration in real-time
  updateDuration: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        duration: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.workoutLog.update({
        where: { id: input.id },
        data: { duration: input.duration },
      });
    }),
});
