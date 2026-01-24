import type { PrismaClient } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

/** Update matching goals when a workout is completed (recordProgress). */
async function updateGoalsFromWorkoutCompletion(
  db: PrismaClient,
  userId: string,
  workout: {
    id: string;
    exercises: { exerciseId: string; weight: number | null; reps: number }[];
  },
) {
  const activeGoals = await db.goal.findMany({
    where: { userId, status: "active" },
  });

  const notes = `From workout on ${new Date().toLocaleDateString()}`;

  for (const goal of activeGoals) {
    let value: number | null = null;

    if (goal.type === "consistency") {
      value = goal.currentValue + 1;
    } else if (goal.type === "strength" && goal.exerciseId) {
      const ex = workout.exercises.find((e) => e.exerciseId === goal.exerciseId);
      if (ex?.weight != null && ex.weight > 0) value = ex.weight;
    } else if (goal.type === "reps" && goal.exerciseId) {
      const ex = workout.exercises.find((e) => e.exerciseId === goal.exerciseId);
      if (ex && ex.reps > 0) value = ex.reps;
    }
    // bodyweight: skip (not updated from workout completion)

    if (value == null) continue;
    if (goal.type !== "consistency" && value <= goal.currentValue) continue;

    await db.goalProgress.create({
      data: { goalId: goal.id, value, notes },
    });

    const reached = value >= goal.targetValue;
    await db.goal.update({
      where: { id: goal.id, userId },
      data: {
        currentValue: value,
        ...(reached && { status: "completed" as const, completedAt: new Date() }),
      },
    });
  }
}

export const workoutLogRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        date: z.date().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Use provided date or set to today's date in UTC (start of day)
      let workoutDate: Date;
      if (input.date) {
        // If date is provided, normalize it to start of day in UTC
        const providedDate = new Date(input.date);
        workoutDate = new Date(
          Date.UTC(
            providedDate.getUTCFullYear(),
            providedDate.getUTCMonth(),
            providedDate.getUTCDate(),
            0,
            0,
            0,
            0,
          ),
        );
      } else {
        // Default to today in UTC (start of day)
        const now = new Date();
        workoutDate = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            0,
            0,
            0,
            0,
          ),
        );
      }

      const log = await ctx.db.workoutLog.create({
        data: {
          userId: input.userId,
          date: workoutDate,
          notes: input.notes,
        },
      });

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
            orderBy: { order: "asc" },
          },
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
      // Get the current max order for this workout
      const maxOrder = await ctx.db.workoutLogExercise.findFirst({
        where: { workoutLogId: input.workoutLogId },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      return ctx.db.workoutLogExercise.create({
        data: {
          workoutLogId: input.workoutLogId,
          exerciseId: input.exerciseId,
          sets: input.sets,
          reps: input.reps,
          weight: input.weight,
          rpe: input.rpe,
          notes: input.notes,
          order: (maxOrder?.order ?? -1) + 1,
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

  reorderExercises: publicProcedure
    .input(
      z.object({
        workoutLogId: z.string().min(1),
        orderedIds: z.array(z.string().min(1)).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify all exercise IDs belong to this workout
      const exercises = await ctx.db.workoutLogExercise.findMany({
        where: {
          workoutLogId: input.workoutLogId,
          id: { in: input.orderedIds },
        },
      });

      if (exercises.length !== input.orderedIds.length) {
        throw new Error(
          "Some exercise IDs not found or don't belong to this workout",
        );
      }

      // Update order for each exercise based on its position in the array
      await ctx.db.$transaction(
        input.orderedIds.map((exerciseId, index) =>
          ctx.db.workoutLogExercise.update({
            where: { id: exerciseId, workoutLogId: input.workoutLogId },
            data: { order: index },
          }),
        ),
      );
      return { ok: true };
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
        },
        include: {
          exercises: true,
        },
      });

      // Update matching goals (recordProgress) when workout is completed
      try {
        await updateGoalsFromWorkoutCompletion(ctx.db, workout.userId, {
          id: workout.id,
          exercises: workout.exercises.map((e) => ({
            exerciseId: e.exerciseId,
            weight: e.weight,
            reps: e.reps,
          })),
        });
      } catch (e) {
        console.error("[workoutLog.complete] Goals update failed:", e);
        // Don't fail the mutation; workout is already completed
      }

      return workout;
    }),

  // Quick start creates an empty workout log for today.
  quickStart: publicProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      const todayUTC = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      );

      return ctx.db.workoutLog.create({
        data: {
          userId: input.userId,
          date: todayUTC,
        },
      });
    }),

  // Get workout with history context
  getWithHistory: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        includeLastWorkout: z.boolean().default(true),
      }),
    )
    .query(async ({ ctx, input }) => {
      const workout = await ctx.db.workoutLog.findUnique({
        where: { id: input.id },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { order: "asc" },
          },
          // Note: sets relation will be available after migration
          // Frontend handles fallback to exercises if sets don't exist
        },
      });

      if (!workout) return null;

      const exercisesToDisplay = workout.exercises;

      let lastWorkout = null;
      if (input.includeLastWorkout) {
        lastWorkout = await ctx.db.workoutLog.findFirst({
          where: {
            userId: workout.userId,
            id: { not: workout.id },
            completed: true,
          },
          orderBy: { date: "desc" },
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { order: "asc" },
            },
          },
        });
      }

      return {
        ...workout,
        // Always use exercises (from plan if no logged exercises exist)
        exercises: exercisesToDisplay,
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
      }),
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

      const workoutDates = recentLogs.map((log) => {
        const date = new Date(log.date);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      });

      // Remove duplicates and sort
      const uniqueDates = [...new Set(workoutDates)].sort((a, b) => b - a);

      // Calculate current streak from today
      let expectedDate = today.getTime();
      for (const date of uniqueDates) {
        const diffDays = Math.floor(
          (expectedDate - date) / (1000 * 60 * 60 * 24),
        );

        if (diffDays === 0 || diffDays === 1) {
          currentStreak++;
          expectedDate = date - 1000 * 60 * 60 * 24;
        } else {
          break;
        }
      }

      // Calculate longest streak
      tempStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const diffDays = Math.floor(
          (uniqueDates[i - 1]! - uniqueDates[i]!) / (1000 * 60 * 60 * 24),
        );

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
        period: z.enum(["week", "month", "year"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const startDate = input.startDate ?? new Date();

      if (!input.startDate) {
        switch (input.period) {
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "year":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          case "month":
          default:
            startDate.setMonth(now.getMonth() - 1);
            break;
        }
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
          volumeByMuscleGroup[muscle] =
            (volumeByMuscleGroup[muscle] ?? 0) + volume;
        });
      });

      const avgDuration =
        logs.reduce((sum, log) => sum + (log.duration ?? 0), 0) /
          totalWorkouts || 0;

      return {
        totalWorkouts,
        totalVolume,
        avgDuration: Math.round(avgDuration),
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.workoutLog.update({
        where: { id: input.id },
        data: { duration: input.duration },
      });
    }),

  // Check for recent completed workouts (within last 6 hours)
  checkRecentWorkout: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        hoursBack: z.number().default(6), // Default: check last 6 hours
      }),
    )
    .query(async ({ ctx, input }) => {
      const hoursAgo = new Date();
      hoursAgo.setHours(hoursAgo.getHours() - input.hoursBack);

      const recentWorkout = await ctx.db.workoutLog.findFirst({
        where: {
          userId: input.userId,
          completed: true,
          date: {
            gte: hoursAgo,
          },
        },
        orderBy: { date: "desc" },
      });

      if (!recentWorkout) {
        return { hasRecentWorkout: false, workout: null };
      }

      const timeDiff = Date.now() - recentWorkout.date.getTime();
      const hoursSince = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutesSince = Math.floor(
        (timeDiff % (1000 * 60 * 60)) / (1000 * 60),
      );

      return {
        hasRecentWorkout: true,
        workout: {
          id: recentWorkout.id,
          title: "Workout",
          date: recentWorkout.date,
          duration: recentWorkout.duration,
          hoursSince,
          minutesSince,
        },
      };
    }),

  // Duplicate a workout (create a new workout with same exercises)
  duplicate: publicProcedure
    .input(z.object({ id: z.string().min(1), date: z.date().optional() }))
    .mutation(async ({ ctx, input }) => {
      const sourceLog = await ctx.db.workoutLog.findUnique({
        where: { id: input.id },
        include: {
          exercises: {
            include: { exercise: true }, // Include exercise relation to check if it exists
          },
        },
      });

      if (!sourceLog) {
        throw new Error("Workout log not found");
      }

      // Create new workout log
      const newLog = await ctx.db.workoutLog.create({
        data: {
          userId: sourceLog.userId,
          date: input.date ?? new Date(),
          notes: sourceLog.notes,
          completed: false,
        },
      });

      // Copy exercises
      if (sourceLog.exercises.length > 0) {
        // Filter out exercises with null exercise relation and preserve order
        const validExercises = sourceLog.exercises
          .filter((ex) => ex.exercise != null)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        if (validExercises.length > 0) {
          await ctx.db.workoutLogExercise.createMany({
            data: validExercises.map((ex, index) => ({
              workoutLogId: newLog.id,
              exerciseId: ex.exerciseId,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight,
              rpe: ex.rpe,
              notes: ex.notes,
              order: ex.order ?? index, // Preserve original order or use index
            })),
          });
        }
      }

      return newLog;
    }),

  // Reschedule a workout (change date)
  reschedule: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        date: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.workoutLog.update({
        where: { id: input.id },
        data: {
          date: input.date,
        },
      });
    }),

  // Get active (incomplete) workout for user
  getActiveWorkout: publicProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.workoutLog.findFirst({
        where: {
          userId: input.userId,
          completed: false,
        },
        orderBy: { date: "desc" },
      });
    }),

  // Sync offline workouts to database
  syncFromOffline: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        workouts: z.array(
          z.object({
            // Common fields (both workoutRepo and OfflineWorkoutLog formats)
            date: z.string(), // ISO
            startTime: z.string(), // ISO
            endTime: z.string().nullish(), // ISO
            completed: z.boolean(),
            notes: z.string().nullish(),
            sets: z.array(
              z.object({
                exerciseId: z.string(),
                exerciseName: z.string().optional(),
                setNumber: z.number(),
                // Support both string (workoutRepo) and number (OfflineWorkoutLog) formats
                targetReps: z.union([z.string(), z.number()]).nullish(),
                actualReps: z.union([z.string(), z.number()]),
                targetWeight: z.union([z.string(), z.number()]).nullish(),
                actualWeight: z.union([z.string(), z.number()]).nullish(),
                rpe: z.number().nullish(),
                completed: z.boolean(),
              }),
            ),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const syncedIds: string[] = [];
      const errors: Array<{ workoutIndex: number; error: string }> = [];
      type TransformedSet = {
        exerciseId: string;
        setNumber: number;
        targetReps: number | null;
        actualReps: number;
        targetWeight: number | null;
        actualWeight: number | null;
        rpe: number | null;
        completed: boolean;
      };

      for (let i = 0; i < input.workouts.length; i++) {
        const workout = input.workouts[i];
        if (!workout) continue;

        try {
          const uniqueExerciseIds = Array.from(
            new Set(workout.sets.map((set) => set.exerciseId).filter(Boolean)),
          );
          const existingExercises =
            uniqueExerciseIds.length > 0
              ? await ctx.db.exercise.findMany({
                  where: { id: { in: uniqueExerciseIds } },
                })
              : [];
          const exerciseIdMap = new Map<string, string>(
            existingExercises.map((ex) => [ex.id, ex.id]),
          );

          const nameLookup = new Map<string, string>();
          for (const set of workout.sets) {
            if (set.exerciseName && !nameLookup.has(set.exerciseId)) {
              nameLookup.set(set.exerciseId, set.exerciseName);
            }
          }

          const missingExerciseIds = uniqueExerciseIds.filter(
            (id) => !exerciseIdMap.has(id),
          );

          if (missingExerciseIds.length > 0) {
            const created = await Promise.all(
              missingExerciseIds.map(async (missingId) => {
                const name = nameLookup.get(missingId);
                if (!name) return null;
                const existingByName = await ctx.db.exercise.findFirst({
                  where: { name },
                });
                if (existingByName) return { fromId: missingId, toId: existingByName.id };
                const createdExercise = await ctx.db.exercise.create({
                  data: {
                    name,
                    muscleGroup: "Custom",
                  },
                });
                return { fromId: missingId, toId: createdExercise.id };
              }),
            );

            for (const entry of created) {
              if (entry) exerciseIdMap.set(entry.fromId, entry.toId);
            }
          }

          // Normalize date to UTC start of day
          const workoutDate = new Date(workout.date);
          const normalizedDate = new Date(
            Date.UTC(
              workoutDate.getUTCFullYear(),
              workoutDate.getUTCMonth(),
              workoutDate.getUTCDate(),
              0,
              0,
              0,
              0,
            ),
          );

          // Check for existing workout on same date (conflict handling)
          const existing = await ctx.db.workoutLog.findFirst({
            where: {
              userId: input.userId,
              date: normalizedDate,
            },
          });

          if (existing) {
            // Skip duplicate - workout already exists for this date
            errors.push({
              workoutIndex: i,
              error: "Workout already exists for this date",
            });
            continue;
          }

          // Convert ISO strings to DateTime
          const startTime = new Date(workout.startTime);
          const endTime = workout.endTime ? new Date(workout.endTime) : null;

          // Calculate duration (minutes)
          const duration =
            endTime && startTime
              ? Math.round((endTime.getTime() - startTime.getTime()) / 60000)
              : null;

          // Transform sets: convert strings to numbers if needed
          const transformedSets = workout.sets
            .filter((set) => set.exerciseId && set.setNumber > 0) // Filter invalid sets
            .map((set) => {
              const mappedExerciseId = exerciseIdMap.get(set.exerciseId) ?? null;
              if (!mappedExerciseId) return null;
              // Helper to safely convert string/number to number
              const toNumber = (
                value: string | number | null | undefined,
              ): number | null => {
                if (value == null) return null;
                if (typeof value === "number") {
                  return Number.isNaN(value) || value < 0 ? null : value;
                }
                if (typeof value === "string") {
                  const parsed = Number.parseFloat(value);
                  return Number.isNaN(parsed) || parsed < 0 ? null : parsed;
                }
                return null;
              };

              return {
                exerciseId: mappedExerciseId,
                setNumber: set.setNumber,
                targetReps: toNumber(set.targetReps),
                actualReps: toNumber(set.actualReps) ?? 0, // Default to 0 if invalid
                targetWeight: toNumber(set.targetWeight),
                actualWeight: toNumber(set.actualWeight),
                rpe:
                  set.rpe != null && set.rpe >= 1 && set.rpe <= 10
                    ? set.rpe
                    : null,
                completed: set.completed ?? false,
              };
            })
            .filter((set): set is TransformedSet => set !== null);

          // Skip workout if no valid sets
          if (transformedSets.length === 0) {
            errors.push({
              workoutIndex: i,
              error: "No valid sets to sync (missing exercises)",
            });
            continue;
          }

          // Calculate total volume (sum of actualWeight * actualReps)
          const totalVolume = transformedSets.reduce((sum, set) => {
            if (set.actualWeight != null && set.actualWeight > 0 && set.actualReps > 0) {
              return sum + set.actualWeight * set.actualReps;
            }
            return sum;
          }, 0);

          // Create WorkoutLog
          const workoutLog = await ctx.db.workoutLog.create({
            data: {
              userId: input.userId,
              date: normalizedDate,
              startTime,
              endTime,
              duration,
              notes: workout.notes ?? null,
              completed: workout.completed,
              totalVolume: totalVolume > 0 ? totalVolume : null,
            },
          });

          // Group sets by exerciseId to create WorkoutLogExercise aggregates
          const setsByExercise = new Map<
            string,
            Array<typeof transformedSets[number]>
          >();
          for (const set of transformedSets) {
            const existing = setsByExercise.get(set.exerciseId) ?? [];
            existing.push(set);
            setsByExercise.set(set.exerciseId, existing);
          }

          // Create WorkoutLogExercise for each exercise (aggregate)
          const exerciseEntries: Array<{
            workoutLogId: string;
            exerciseId: string;
            sets: number;
            reps: number;
            weight: number | null;
            rpe: number | null;
            order: number;
          }> = [];

          let exerciseOrder = 0;
          for (const [exerciseId, sets] of setsByExercise.entries()) {
            const completedSets = sets.filter((s) => s.completed);
            const totalSets = sets.length;
            const avgReps =
              completedSets.length > 0
                ? Math.round(
                    completedSets.reduce((sum, s) => sum + s.actualReps, 0) /
                      completedSets.length,
                  )
                : sets[0]?.targetReps ?? sets[0]?.actualReps ?? 0;
            const avgWeight =
              completedSets.length > 0
                ? completedSets.reduce((sum, s) => sum + (s.actualWeight ?? 0), 0) /
                  completedSets.length
                : sets[0]?.targetWeight ?? sets[0]?.actualWeight ?? null;
            const avgRpe =
              completedSets.length > 0
                ? Math.round(
                    completedSets.reduce(
                      (sum, s) => sum + (s.rpe ?? 0),
                      0,
                    ) / completedSets.length,
                  )
                : null;

            exerciseEntries.push({
              workoutLogId: workoutLog.id,
              exerciseId,
              sets: totalSets,
              reps: avgReps,
              weight: avgWeight && avgWeight > 0 ? avgWeight : null,
              rpe: avgRpe && avgRpe > 0 ? avgRpe : null,
              order: exerciseOrder++,
            });
          }

          if (exerciseEntries.length > 0) {
            await ctx.db.workoutLogExercise.createMany({
              data: exerciseEntries,
            });
          }

          // Create WorkoutSet records for each set
          if (transformedSets.length > 0) {
            await ctx.db.workoutSet.createMany({
              data: transformedSets.map((set) => ({
                workoutLogId: workoutLog.id,
                exerciseId: set.exerciseId,
                setNumber: set.setNumber,
                targetReps: set.targetReps,
                actualReps: set.actualReps,
                targetWeight: set.targetWeight,
                actualWeight: set.actualWeight,
                rpe: set.rpe,
                completed: set.completed,
              })),
            });
          }

          syncedIds.push(workoutLog.id);
        } catch (error) {
          errors.push({
            workoutIndex: i,
            error:
              error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return {
        synced: syncedIds.length,
        failed: errors.length,
        syncedIds,
        errors,
      };
    }),
});
