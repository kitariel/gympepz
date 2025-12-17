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
          sets: true,
        },
      });

      // Calculate total volume
      const totalVolume = workout.sets.reduce((sum, set) => {
        return sum + (set.actualWeight ?? 0) * set.actualReps;
      }, 0);

      await ctx.db.workoutLog.update({
        where: { id: input.id },
        data: { totalVolume },
      });

      // Update streak
      const streak = await ctx.db.workoutStreak.findUnique({
        where: { userId: workout.userId },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (streak) {
        const lastWorkoutDate = streak.lastWorkout
          ? new Date(streak.lastWorkout)
          : null;
        if (lastWorkoutDate) {
          lastWorkoutDate.setHours(0, 0, 0, 0);
        }

        const diffDays = lastWorkoutDate
          ? Math.floor(
              (today.getTime() - lastWorkoutDate.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0;

        let newStreak = streak.currentStreak;

        if (diffDays === 0) {
          // Same day, don't change streak
        } else if (diffDays === 1) {
          // Next day, increment streak
          newStreak = streak.currentStreak + 1;
        } else {
          // Streak broken, reset to 1
          newStreak = 1;
        }

        await ctx.db.workoutStreak.update({
          where: { userId: workout.userId },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, streak.longestStreak),
            lastWorkout: new Date(),
          },
        });
      } else {
        // Create initial streak
        await ctx.db.workoutStreak.create({
          data: {
            userId: workout.userId,
            currentStreak: 1,
            longestStreak: 1,
            lastWorkout: new Date(),
          },
        });
      }

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

      // Create sets for each exercise
      if (nextDay.items.length > 0) {
        const setsToCreate = nextDay.items.flatMap((item) =>
          Array.from({ length: item.sets }, (_, i) => ({
            workoutLogId: log.id,
            exerciseId: item.exerciseId,
            setNumber: i + 1,
            targetReps: item.reps,
            targetWeight: item.weight ?? undefined,
            actualReps: 0,
            restSeconds: 180, // Default 3 min rest
          }))
        );

        await ctx.db.workoutSet.createMany({
          data: setsToCreate,
        });
      }

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
          sets: {
            include: { exercise: true },
            orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
          },
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
            sets: {
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
          _count: { select: { sets: true } },
        },
        orderBy: { date: "asc" },
      });

      return logs;
    }),

  // Get streak
  getStreak: publicProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const streak = await ctx.db.workoutStreak.findUnique({
        where: { userId: input.userId },
      });

      return (
        streak ?? {
          currentStreak: 0,
          longestStreak: 0,
          lastWorkout: null,
        }
      );
    }),

  // Analytics
  getAnalytics: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        period: z.enum(["week", "month", "year"]).default("month"),
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      let startDate = new Date();

      if (input.period === "week") {
        startDate.setDate(now.getDate() - 7);
      } else if (input.period === "month") {
        startDate.setMonth(now.getMonth() - 1);
      } else {
        startDate.setFullYear(now.getFullYear() - 1);
      }

      const logs = await ctx.db.workoutLog.findMany({
        where: {
          userId: input.userId,
          date: { gte: startDate },
          completed: true,
        },
        include: {
          sets: {
            include: { exercise: true },
          },
        },
      });

      const totalWorkouts = logs.length;
      const totalVolume = logs.reduce((sum, log) => sum + (log.totalVolume ?? 0), 0);
      const avgDuration = logs.reduce((sum, log) => sum + (log.duration ?? 0), 0) / totalWorkouts || 0;

      // Volume by muscle group
      const volumeByMuscleGroup: Record<string, number> = {};
      logs.forEach((log) => {
        log.sets.forEach((set) => {
          const muscle = set.exercise.muscleGroup;
          const volume = (set.actualWeight ?? 0) * set.actualReps;
          volumeByMuscleGroup[muscle] =
            (volumeByMuscleGroup[muscle] ?? 0) + volume;
        });
      });

      return {
        totalWorkouts,
        totalVolume,
        avgDuration: Math.round(avgDuration),
        volumeByMuscleGroup,
        period: input.period,
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
