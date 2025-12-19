import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { mastra } from "@/mastra";
import { handleSuggest } from "./plan.suggest";
import { workoutPlannerAgent } from "@/mastra/agents";

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
    .min(1),
});

export const planRouter = createTRPCRouter({
  create: publicProcedure
    .input(CreatePlanInput)
    .mutation(async ({ ctx, input }) => {
      const created = await ctx.db.plan.create({
        data: {
          userId: input.userId,
          name: input.name,
          days: {
            create: input.days.map((d) => ({
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
            select: { id: true, title: true, order: true }
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
        include: { days: { include: { items: { include: { exercise: true } } }, orderBy: { order: "asc" } } },
      });
    }),

  // Get today's workout from active plan
  getTodaysWorkout: publicProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        include: {
          activePlan: {
            include: {
              days: {
                include: {
                  items: {
                    include: { exercise: true },
                  },
                },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });

      if (!user?.activePlan) {
        return { hasPlan: false, plan: null, todayWorkout: null };
      }

      // Get last completed workout with plan day
      const lastLog = await ctx.db.workoutLog.findFirst({
        where: {
          userId: input.userId,
          planDayId: { not: null },
          completed: true,
        },
        orderBy: { date: "desc" },
        include: { planDay: true },
      });

      // Determine today's workout day
      let todayDay = user.activePlan.days[0]; // Default to first day
      
      if (lastLog?.planDay) {
        const lastDayOrder = lastLog.planDay.order;
        const nextDayIndex = user.activePlan.days.findIndex(
          (d) => d.order > lastDayOrder
        );
        if (nextDayIndex >= 0) {
          todayDay = user.activePlan.days[nextDayIndex]!;
        } else {
          // Cycle back to first day
          todayDay = user.activePlan.days[0]!;
        }
      }

      return {
        hasPlan: true,
        plan: {
          id: user.activePlan.id,
          name: user.activePlan.name,
        },
        todayWorkout: todayDay
          ? {
              id: todayDay.id,
              title: todayDay.title,
              order: todayDay.order,
              exercises: todayDay.items.map((item) => ({
                id: item.id,
                exerciseId: item.exerciseId,
                exerciseName: item.exercise.name,
                muscleGroup: item.exercise.muscleGroup,
                sets: item.sets,
                reps: item.reps,
                weight: item.weight,
              })),
            }
          : null,
      };
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const day = await ctx.db.planDay.create({
        data: { planId: input.planId, title: input.title, order: input.order },
      });
      return { ok: true, id: day.id };
    }),
  updateDay: publicProcedure
    .input(z.object({ id: z.string().min(1), title: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.planDay.update({
        where: { id: input.id },
        data: { title: input.title },
      });
      return { ok: true };
    }),
  deleteDay: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.planDay.delete({ where: { id: input.id } });
      return { ok: true };
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
      const it = await ctx.db.planExercise.create({
        data: {
          planDayId: input.dayId,
          exerciseId: input.exerciseId,
          sets: input.sets,
          reps: input.reps,
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
    .mutation(async ({ ctx }) => {
      return { ok: true };
    }),
  reorderDays: publicProcedure
    .input(
      z.object({
        planId: z.string().min(1),
        orderedIds: z.array(z.string().min(1)).min(1),
      }),
    )
    .mutation(async ({ ctx }) => {
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
          const normalized = daysFromAi.map((d, idx) => ({
            title: d.title ?? `Day ${idx + 1}`,
            order: idx,
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
                    items: { create: d.items },
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
      const days: {
        title: string;
        order: number;
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
        days.push({ title, order: i, items });
      }
      const created = await ctx.db.plan.create({
        data: {
          userId: input.userId,
          name: `${input.goal} Plan`,
          days: {
            create: days.map((d) => ({
              title: d.title,
              order: d.order,
              items: { create: d.items },
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
