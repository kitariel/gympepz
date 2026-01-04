import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { mastra } from "@/mastra";
import { handleSuggest } from "./plan.suggest";
import { workoutPlannerAgent } from "@/mastra/agents";
import { appendFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";

// Helper function for debug logging
const debugLog = (location: string, message: string, data: unknown, hypothesisId: string) => {
  try {
    const logData = { location, message, data, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId };
    const logPath = join(process.cwd(), '.cursor', 'debug.log');
    const logDir = dirname(logPath);
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }
    appendFileSync(logPath, JSON.stringify(logData) + '\n');
  } catch (e) {
    console.error('Debug log write failed:', e);
    console.log(message, data);
  }
};

const PlanExerciseInput = z.object({
  exerciseId: z.string().min(1),
  sets: z.number().min(1).max(20),
  reps: z.number().min(1).max(50),
  weight: z.number().min(0).max(1000).optional(),
});

const CreatePlanInput = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  days: z
    .array(
      z.object({
        title: z.string().min(1),
        order: z.number().min(0),
        items: z.array(PlanExerciseInput).default([]),
      }),
    )
    .default([]), // Allow empty array - will create 7 days automatically
});

export const planRouter = createTRPCRouter({
  create: publicProcedure
    .input(CreatePlanInput)
    .mutation(async ({ ctx, input }) => {
      // Day names for order 0-6 (Sunday-Saturday)
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      // If input.days is provided, use it; otherwise create 7 empty days
      const daysToCreate = input.days.length > 0
        ? input.days.map((d) => ({
          title: d.title,
          order: d.order,
          day: d.order >= 0 && d.order < 7 ? dayNames[d.order] : null,
          items: {
            create: d.items.map((i, itemIndex) => ({
              exerciseId: i.exerciseId,
              sets: i.sets,
              reps: i.reps,
              weight: i.weight ?? null,
              order: itemIndex,
            })),
          },
        }))
        : dayNames.map((dayName, index) => ({
          title: dayName,
          order: index,
          day: dayName,
          items: {
            create: [],
          },
        }));

      const created = await ctx.db.plan.create({
        data: {
          userId: input.userId,
          name: input.name,
          days: {
            create: daysToCreate,
          },
        },
        include: { days: { include: { items: true } } },
      });
      return created;
    }),
  listByUser: publicProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const plans = await ctx.db.plan.findMany({
        where: { userId: input.userId },
        orderBy: { updatedAt: "desc" },
        include: {
          _count: { select: { days: true } },
          days: {
            select: { id: true, title: true, order: true, isRestDay: true }
          }
        },
      });
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: { activePlanId: true },
      });
      return plans.map((p) => ({
        id: p.id,
        userId: p.userId,
        name: p.name,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        daysCount: (p as { _count?: { days?: number } })._count?.days ?? 0,
        isActive: user?.activePlanId === p.id,
        days: p.days,
      }));
    }),
  get: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.plan.findUnique({
        where: { id: input.id },
        include: { 
          days: { 
            include: { 
              items: { 
                include: { exercise: true },
                orderBy: { order: "asc" }
              } 
            }, 
            orderBy: { order: "asc" } 
          } 
        },
      });
    }),

  // Get today's workout from active plan
  getTodaysWorkout: publicProcedure
    .input(z.object({ 
      userId: z.string().min(1),
      day: z.enum(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Constants
      const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const DAY_ORDER_MAP: Record<string, number> = {
        "Sunday": 0,
        "Monday": 1,
        "Tuesday": 2,
        "Wednesday": 3,
        "Thursday": 4,
        "Friday": 5,
        "Saturday": 6,
      };
      
      // Use provided day from client (local timezone) or fall back to UTC calculation
      const now = new Date();
      const currentDayName = input.day ?? DAY_NAMES[now.getUTCDay()]!;
      const currentDayOfWeek = input.day ? DAY_ORDER_MAP[input.day]! : now.getUTCDay();
      const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

      // Fetch user with active plan
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        include: {
          activePlan: {
            include: {
              days: {
                include: { items: { include: { exercise: true } } },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });

      if (!user?.activePlan) {
        return { hasPlan: false, plan: null, todayWorkout: null };
      }

      const planDays = user.activePlan.days;

      // Helper: Check if day has exercises
      const hasExercises = (day: typeof planDays[0]) => {
        return day && day.items.length > 0 && day.items.some((item) => item.exercise !== null);
      };

      // Helper: Normalize order (7 -> 6 for Saturday)
      const normalizeOrder = (order: number) => (order === 7 ? 6 : order);

      // Helper: Match day by day field or order
      // Checks day field first (most reliable), then falls back to order
      const matchesDayOfWeek = (day: typeof planDays[0], targetDayName: string, targetDayOrder: number) => {
        // First try to match by day field (e.g., "Monday")
        if (day.day === targetDayName) return true;
        // Fall back to matching by order if day field doesn't match or is null
        return normalizeOrder(day.order) === targetDayOrder;
      };

      // Helper: Find day matching specific day of week
      // Returns the matching day, prioritizing days with exercises, but still returns a day without exercises if that's the only match
      const findDayForDayOfWeek = (dayName: string, dayOrder: number) => {
        const matches = planDays.filter(d => matchesDayOfWeek(d, dayName, dayOrder));
        // Prioritize days with exercises, but return any match if no day with exercises exists
        return matches.find(hasExercises) ?? matches[0] ?? undefined;
      };

      // Get last completed workout
      const lastLog = await ctx.db.workoutLog.findFirst({
        where: { userId: input.userId, planDayId: { not: null }, completed: true },
        orderBy: { date: "desc" },
        include: { planDay: { include: { items: { include: { exercise: true } } } } },
      });

      // Determine which day to show
      // First, try to find exact match for today's day of week
      let selectedDay = findDayForDayOfWeek(currentDayName!, currentDayOfWeek);

      // Only fallback if there's absolutely no match for today's day
      // This ensures we show the correct day of week, even if it has no exercises
      if (!selectedDay) {
        // No day matches today - fallback to first day with exercises as last resort
        selectedDay = planDays.find(hasExercises) ?? planDays[0];
      }

      // Adjust selection based on last workout log
      if (lastLog?.planDay && selectedDay) {
        const lastLogDateUTC = new Date(Date.UTC(
          lastLog.date.getUTCFullYear(),
          lastLog.date.getUTCMonth(),
          lastLog.date.getUTCDate()
        ));
        const wasCompletedToday = lastLogDateUTC.getTime() === todayUTC.getTime();

        if (wasCompletedToday) {
          // Show next day after completion
          const nextDayOfWeek = (currentDayOfWeek + 1) % 7;
          const nextDayName = DAY_NAMES[nextDayOfWeek]!;
          
          let nextDay = findDayForDayOfWeek(nextDayName, nextDayOfWeek);
          
          if (!nextDay) {
            // Find next by order
            const lastOrder = normalizeOrder(lastLog.planDay.order);
            const nextDayIndex = planDays.findIndex(d => normalizeOrder(d.order) > lastOrder);
            nextDay = nextDayIndex >= 0 
              ? planDays[nextDayIndex]! 
              : planDays.find(hasExercises) ?? planDays[0]!;
          }
          
          selectedDay = nextDay;
        } else {
          // Check if should repeat last day
          const lastDayInPlan = planDays.find(d => d.id === lastLog.planDay!.id);
          const lastDayMatchesToday = lastLog.planDay.day 
            ? lastLog.planDay.day === currentDayName
            : normalizeOrder(lastLog.planDay.order) === currentDayOfWeek;

          if (lastDayMatchesToday && lastDayInPlan && hasExercises(lastDayInPlan)) {
            selectedDay = lastDayInPlan;
          }
        }
      }

      // Build result
      const result = {
        hasPlan: true,
        plan: { id: user.activePlan.id, name: user.activePlan.name },
        todayWorkout: selectedDay
          ? {
              id: selectedDay.id,
              title: selectedDay.title,
              order: selectedDay.order,
              isRestDay: selectedDay.isRestDay ?? false,
              exercises: selectedDay.items
                .filter((item) => item.exercise !== null)
                .map((item) => ({
                  id: item.id,
                  exerciseId: item.exerciseId,
                  exerciseName: item.exercise!.name,
                  muscleGroup: item.exercise!.muscleGroup,
                  sets: item.sets,
                  reps: item.reps,
                  weight: item.weight,
                })),
            }
          : null,
      };

      return result;
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.plan.delete({ where: { id: input.id } });
      return { ok: true };
    }),
  duplicate: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const src = await ctx.db.plan.findUnique({
        where: { id: input.id },
        include: { days: { include: { items: true } } },
      });
      if (!src) return { ok: false };
      const dup = await ctx.db.plan.create({
        data: {
          userId: src.userId,
          name: `${src.name} Copy`,
          days: {
            create: src.days.map((d) => ({
              title: d.title,
              order: d.order,
              items: {
                create: d.items.map((i) => ({
                  exerciseId: i.exerciseId,
                  sets: i.sets,
                  reps: i.reps,
                  weight: i.weight ?? null,
                })),
              },
            })),
          },
        },
      });
      return { ok: true, id: dup.id };
    }),
  setActive: publicProcedure
    .input(z.object({ userId: z.string().min(1), planId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.update({
        where: { id: input.userId },
        data: { activePlanId: input.planId },
      });
      return { ok: true };
    }),
  updateMeta: publicProcedure
    .input(z.object({ id: z.string().min(1), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.plan.update({
        where: { id: input.id },
        data: { name: input.name },
      });
      return { ok: true };
    }),
  addDay: publicProcedure
    .input(
      z.object({
        planId: z.string().min(1),
        title: z.string().min(1),
        order: z.number().min(0),
        day: z.string().optional(), // Day of week name
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Day names for order 0-6 (Sunday-Saturday)
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = input.day ?? (input.order >= 0 && input.order < 7 ? dayNames[input.order] : null);

      const day = await ctx.db.planDay.create({
        data: {
          planId: input.planId,
          title: input.title,
          order: input.order,
          day: dayName,
        },
      });
      return { ok: true, id: day.id };
    }),
  updateDay: publicProcedure
    .input(z.object({ id: z.string().min(1), title: z.string().min(1), order: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      // Day names for order 0-6 (Sunday-Saturday), order 7 also maps to Saturday
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      const updateData: { title: string; order?: number; day?: string | null } = { title: input.title };
      if (input.order !== undefined) {
        updateData.order = input.order;
        // Update day field based on order
        updateData.day = input.order === 7 ? "Saturday" : (input.order >= 0 && input.order < 7 ? dayNames[input.order] : null);
      }
      await ctx.db.planDay.update({
        where: { id: input.id },
        data: updateData,
      });
      return { ok: true };
    }),
  updateDayOrder: publicProcedure
    .input(z.object({ id: z.string().min(1), order: z.number().min(0) }))
    .mutation(async ({ ctx, input }) => {
      // Day names for order 0-6 (Sunday-Saturday), order 7 also maps to Saturday
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = input.order === 7 ? "Saturday" : (input.order >= 0 && input.order < 7 ? dayNames[input.order] : null);

      await ctx.db.planDay.update({
        where: { id: input.id },
        data: {
          order: input.order,
          day: dayName,
        },
      });
      return { ok: true };
    }),
  updateDaysOrder: publicProcedure
    .input(
      z.object({
        planId: z.string().min(1),
        orders: z.array(
          z.object({
            id: z.string().min(1),
            order: z.number().min(0),
          })
        ).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Day names for order 0-6 (Sunday-Saturday), order 7 also maps to Saturday
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      // Update all day orders and day fields in a transaction
      await ctx.db.$transaction(
        input.orders.map(({ id, order }) => {
          const dayName = order === 7 ? "Saturday" : (order >= 0 && order < 7 ? dayNames[order] : null);
          return ctx.db.planDay.update({
            where: { id, planId: input.planId },
            data: {
              order,
              day: dayName,
            },
          });
        })
      );
      return { ok: true };
    }),
  deleteDay: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.planDay.delete({ where: { id: input.id } });
      return { ok: true };
    }),
  toggleRestDay: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Get current state
      const day = await ctx.db.planDay.findUnique({
        where: { id: input.id },
        select: { isRestDay: true },
      });

      if (!day) {
        throw new Error("Day not found");
      }

      // Toggle the rest day status
      await ctx.db.planDay.update({
        where: { id: input.id },
        data: { isRestDay: !day.isRestDay },
      });

      return { ok: true, isRestDay: !day.isRestDay };
    }),
  duplicateDay: publicProcedure
    .input(z.object({ dayId: z.string().min(1), planId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const sourceDay = await ctx.db.planDay.findUnique({
        where: { id: input.dayId },
        include: { items: true },
      });

      if (!sourceDay) {
        throw new Error("Day not found");
      }

      // Get the highest order to append at the end
      const maxOrder = await ctx.db.planDay.findFirst({
        where: { planId: input.planId },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const newDay = await ctx.db.planDay.create({
        data: {
          planId: input.planId,
          title: `${sourceDay.title} Copy`,
          order: (maxOrder?.order ?? -1) + 1,
          day: sourceDay.day, // Preserve day field when duplicating
          items: {
            create: sourceDay.items.map((item) => ({
              exerciseId: item.exerciseId,
              sets: item.sets,
              reps: item.reps,
              weight: item.weight ?? null,
            })),
          },
        },
      });

      return { ok: true, id: newDay.id };
    }),
  copyExercises: publicProcedure
    .input(
      z.object({
        sourceDayId: z.string().min(1),
        targetDayId: z.string().min(1),
        exerciseIds: z.array(z.string().min(1)).optional(), // If provided, only copy these exercises
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sourceDay = await ctx.db.planDay.findUnique({
        where: { id: input.sourceDayId },
        include: { items: true },
      });

      if (!sourceDay) {
        throw new Error("Source day not found");
      }

      // Check if target day exists
      const targetDay = await ctx.db.planDay.findUnique({
        where: { id: input.targetDayId },
        include: { items: true },
      });

      if (!targetDay) {
        throw new Error("Target day not found");
      }

      // Filter exercises if specific IDs provided
      const exercisesToCopy = input.exerciseIds
        ? sourceDay.items.filter((item) => input.exerciseIds!.includes(item.exerciseId))
        : sourceDay.items;

      // Avoid duplicates - check which exercises already exist in target
      const existingExerciseIds = new Set(targetDay.items.map((item) => item.exerciseId));

      const newExercises = exercisesToCopy.filter(
        (item) => !existingExerciseIds.has(item.exerciseId)
      );

      if (newExercises.length > 0) {
        // Get the current max order for target day
        const maxOrder = await ctx.db.planExercise.findFirst({
          where: { planDayId: input.targetDayId },
          orderBy: { order: "desc" },
          select: { order: true },
        });
        const startOrder = (maxOrder?.order ?? -1) + 1;
        
        await ctx.db.planExercise.createMany({
          data: newExercises.map((item, index) => ({
            planDayId: input.targetDayId,
            exerciseId: item.exerciseId,
            sets: item.sets,
            reps: item.reps,
            weight: item.weight ?? null,
            order: startOrder + index,
          })),
        });
      }

      return { ok: true, copied: newExercises.length };
    }),
  addExercise: publicProcedure
    .input(
      z.object({
        dayId: z.string().min(1),
        exerciseId: z.string().min(1),
        sets: z.number().min(1).max(20),
        reps: z.number().min(1).max(50),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the current max order for this day
      const maxOrder = await ctx.db.planExercise.findFirst({
        where: { planDayId: input.dayId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      
      const it = await ctx.db.planExercise.create({
        data: {
          planDayId: input.dayId,
          exerciseId: input.exerciseId,
          sets: input.sets,
          reps: input.reps,
          order: (maxOrder?.order ?? -1) + 1,
        },
      });
      return { ok: true, id: it.id };
    }),
  updateItem: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        sets: z.number().min(1).max(20).optional(),
        reps: z.number().min(1).max(50).optional(),
        weight: z.number().min(0).max(1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.planExercise.update({
        where: { id: input.id },
        data: {
          sets: input.sets ?? undefined,
          reps: input.reps ?? undefined,
          weight: input.weight ?? undefined,
        },
      });
      return { ok: true };
    }),
  deleteItem: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.planExercise.delete({ where: { id: input.id } });
      return { ok: true };
    }),
  reorderItems: publicProcedure
    .input(
      z.object({
        dayId: z.string().min(1),
        orderedIds: z.array(z.string().min(1)).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify all exercise IDs belong to this day
      const exercises = await ctx.db.planExercise.findMany({
        where: {
          planDayId: input.dayId,
          id: { in: input.orderedIds },
        },
      });

      if (exercises.length !== input.orderedIds.length) {
        throw new Error("Some exercise IDs not found or don't belong to this day");
      }

      // Update order for each exercise based on its position in the array
      await ctx.db.$transaction(
        input.orderedIds.map((exerciseId, index) =>
          ctx.db.planExercise.update({
            where: { id: exerciseId, planDayId: input.dayId },
            data: { order: index },
          })
        )
      );
      return { ok: true };
    }),
  reorderDays: publicProcedure
    .input(
      z.object({
        planId: z.string().min(1),
        orderedIds: z.array(z.string().min(1)).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify all day IDs belong to this plan
      const days = await ctx.db.planDay.findMany({
        where: {
          planId: input.planId,
          id: { in: input.orderedIds },
        },
      });

      if (days.length !== input.orderedIds.length) {
        throw new Error("Some day IDs not found or don't belong to this plan");
      }

      // Update order for each day based on its position in the array
      // Array index becomes the new order value (0, 1, 2, ...)
      await Promise.all(
        input.orderedIds.map((dayId, index) =>
          ctx.db.planDay.update({
            where: { id: dayId, planId: input.planId },
            data: { order: index },
          })
        )
      );
      return { ok: true };
    }),

  suggest: publicProcedure
    .input(
      z.object({
        goal: z.string().min(1),
        scheduleDays: z.number().min(1).max(7),
        experience: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
        equipment: z.enum(["Full Gym", "Dumbbells", "Home Setup"]).optional(),
        dayLabel: z.string().optional(),
        rawText: z.string().optional(),
        conversationHistory: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            }),
          )
          .optional(),
        previousDays: z.array(z.string()).optional(),
        useAI: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return handleSuggest(ctx, input);
    }),
  generate: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        goal: z.string().min(1),
        scheduleDays: z.number().min(3).max(6),
        experience: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
        equipment: z.enum(["Full Gym", "Dumbbells", "Home Setup"]).optional(),
        useAI: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.useAI && process.env.OPENAI_API_KEY) {
        try {
          const runner = workoutPlannerAgent as unknown as {
            run: (p: string) => Promise<unknown>;
          };
          const prompt = JSON.stringify({
            goal: input.goal,
            days: input.scheduleDays,
            experience: input.experience,
            equipment: input.equipment,
          });
          const res = await runner.run(prompt);
          type AgentRunResult = { outputText?: string; text?: string };
          const r: AgentRunResult | string = res as AgentRunResult | string;
          const text: string =
            typeof r === "string" ? r : (r.outputText ?? r.text ?? "");
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const parsed = JSON.parse(text || "{}");
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const daysFromAi: {
            title: string;
            items: {
              exerciseId?: string;
              exerciseName?: string;
              sets: number;
              reps: number;
            }[];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          }[] = parsed?.days ?? [];
          const all = await ctx.db.exercise.findMany({
            orderBy: { name: "asc" },
          });
          const mapNameToId = (name?: string) => {
            if (!name) return null;
            const m = all.find(
              (e) => e.name.toLowerCase() === name.toLowerCase(),
            );
            return m?.id ?? null;
          };
          // Day names for order 0-6 (Sunday-Saturday)
          const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

          const normalized = daysFromAi.map((d, idx) => ({
            title: d.title ?? `Day ${idx + 1}`,
            order: idx,
            day: idx < 7 ? dayNames[idx] : null,
            items: d.items
              .map((it) => ({
                exerciseId: it.exerciseId ?? mapNameToId(it.exerciseName) ?? "",
                sets: it.sets,
                reps: it.reps,
              }))
              .filter((x) => x.exerciseId),
          }));
          if (
            normalized.length > 0 &&
            normalized.every((d) => d.items.length > 0)
          ) {
            const created = await ctx.db.plan.create({
              data: {
                userId: input.userId,
                name: `${input.goal} Plan`,
                days: {
                  create: normalized.map((d) => ({
                    title: d.title,
                    order: d.order,
                    day: d.day,
                    items: { 
                      create: d.items.map((item, itemIndex) => ({
                        exerciseId: item.exerciseId,
                        sets: item.sets,
                        reps: item.reps,
                        order: itemIndex,
                      }))
                    },
                  })),
                },
              },
            });
            return { ok: true, id: created.id };
          }
        } catch (e) {
          // ignore and fall back
        }
      }
      const eqFilter =
        input.equipment === "Full Gym"
          ? undefined
          : input.equipment === "Dumbbells"
            ? "Dumbbell"
            : "Bodyweight";
      const all = await ctx.db.exercise.findMany({
        where: eqFilter
          ? { equipment: { contains: eqFilter, mode: "insensitive" } }
          : undefined,
        orderBy: { name: "asc" },
      });
      const vol =
        input.experience === "Advanced"
          ? { sets: 4, reps: 10 }
          : input.experience === "Intermediate"
            ? { sets: 3, reps: 10 }
            : { sets: 3, reps: 8 };
      const pick = (group: string, n: number) => {
        const pool = all.filter((e) =>
          e.muscleGroup.toLowerCase().includes(group),
        );
        const res: { exerciseId: string; sets: number; reps: number }[] = [];
        for (let i = 0; i < Math.min(n, pool.length); i++) {
          const e = pool[i]!;
          res.push({ exerciseId: e.id, sets: vol.sets, reps: vol.reps });
        }
        return res;
      };
      // Day names for order 0-6 (Sunday-Saturday)
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      const days: {
        title: string;
        order: number;
        day: string | null;
        items: { exerciseId: string; sets: number; reps: number }[];
      }[] = [];
      const pattern = ["push", "pull", "legs"] as const;
      for (let i = 0; i < input.scheduleDays; i++) {
        const kind = pattern[i % pattern.length]!;
        const title = kind.charAt(0).toUpperCase() + kind.slice(1);
        const items =
          kind === "push"
            ? pick("chest", 4)
            : kind === "pull"
              ? pick("back", 4)
              : pick("legs", 4);
        days.push({ title, order: i, day: i < 7 ? dayNames[i] : null, items });
      }
      const created = await ctx.db.plan.create({
        data: {
          userId: input.userId,
          name: `${input.goal} Plan`,
          days: {
            create: days.map((d) => ({
              title: d.title,
              order: d.order,
              day: d.day,
              items: { 
                create: d.items.map((item, itemIndex) => ({
                  exerciseId: item.exerciseId,
                  sets: item.sets,
                  reps: item.reps,
                  order: itemIndex,
                }))
              },
            })),
          },
        },
      });
      return { ok: true, id: created.id };
    }),
  adjustDifficulty: publicProcedure
    .input(
      z.object({
        planId: z.string().min(1),
        mode: z.enum(["harder", "easier"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const days = await ctx.db.planDay.findMany({
        where: { planId: input.planId },
        include: { items: true },
      });
      for (const d of days) {
        for (const it of d.items) {
          const sets =
            input.mode === "harder"
              ? Math.min((it.sets ?? 3) + 1, 6)
              : Math.max((it.sets ?? 3) - 1, 1);
          const reps =
            input.mode === "harder"
              ? Math.min((it.reps ?? 8) + 2, 20)
              : Math.max((it.reps ?? 8) - 2, 1);
          await ctx.db.planExercise.update({
            where: { id: it.id },
            data: { sets, reps },
          });
        }
      }
      return { ok: true };
    }),
  replaceExercise: publicProcedure
    .input(
      z.object({ itemId: z.string().min(1), newExerciseId: z.string().min(1) }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.planExercise.update({
        where: { id: input.itemId },
        data: { exerciseId: input.newExerciseId },
      });
      return { ok: true };
    }),
});
