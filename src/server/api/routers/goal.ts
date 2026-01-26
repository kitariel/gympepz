import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

const CreateGoalInput = z.object({
  userId: z.string().min(1),
  type: z.enum(["strength", "reps", "consistency", "bodyweight"]),
  exerciseId: z.string().optional(),
  targetValue: z.number(), // Allow negative for bodyweight "lose" goals (e.g. -10)
  currentValue: z.number().optional(),
  unit: z.enum(["lbs", "kg", "reps", "workouts"]),
  deadline: z.date().optional(),
});

const UpdateGoalInput = z.object({
  userId: z.string().min(1),
  id: z.string(),
  targetValue: z.number().min(0).optional(),
  deadline: z.date().optional().nullable(),
  status: z.enum(["active", "completed", "abandoned"]).optional(),
});

const assertUser = (ctx: { session?: { user?: { id?: string | null } } }, userId: string) => {
  if (!ctx.session?.user?.id || ctx.session.user.id !== userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
};

export const goalRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      assertUser(ctx, input.userId);
      const goals = await ctx.db.goal.findMany({
        where: { userId: input.userId },
        include: { exercise: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      });
      return goals;
    }),

  getById: protectedProcedure
    .input(z.object({ userId: z.string().min(1), id: z.string() }))
    .query(async ({ ctx, input }) => {
      assertUser(ctx, input.userId);
      const goal = await ctx.db.goal.findFirst({
        where: {
          id: input.id,
          userId: input.userId,
        },
        include: {
          exercise: { select: { id: true, name: true } },
          progress: {
            orderBy: { date: "desc" },
            take: 30,
          },
        },
      });
      return goal;
    }),

  create: protectedProcedure
    .input(CreateGoalInput)
    .mutation(async ({ ctx, input }) => {
      assertUser(ctx, input.userId);
      const goal = await ctx.db.goal.create({
        data: {
          userId: input.userId,
          type: input.type,
          exerciseId: input.exerciseId,
          targetValue: input.targetValue,
          unit: input.unit,
          deadline: input.deadline,
          currentValue: input.currentValue ?? 0,
          status: "active",
        },
        include: { exercise: { select: { id: true, name: true } } },
      });
      return goal;
    }),

  update: protectedProcedure
    .input(UpdateGoalInput)
    .mutation(async ({ ctx, input }) => {
      assertUser(ctx, input.userId);
      const { userId, id, ...data } = input;
      const goal = await ctx.db.goal.update({
        where: {
          id,
          userId,
        },
        data: {
          ...(data.targetValue !== undefined && { targetValue: data.targetValue }),
          ...(data.deadline !== undefined && { deadline: data.deadline }),
          ...(data.status !== undefined && { status: data.status }),
        },
        include: { exercise: { select: { id: true, name: true } } },
      });
      return goal;
    }),

  delete: protectedProcedure
    .input(z.object({ userId: z.string().min(1), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      assertUser(ctx, input.userId);
      await ctx.db.goal.delete({
        where: {
          id: input.id,
          userId: input.userId,
        },
      });
      return { success: true };
    }),

  getProgress: protectedProcedure
    .input(
      z.object({ userId: z.string().min(1), goalId: z.string().min(1) }),
    )
    .query(async ({ ctx, input }) => {
      assertUser(ctx, input.userId);
      const goal = await ctx.db.goal.findFirst({
        where: {
          id: input.goalId,
          userId: input.userId,
        },
        include: {
          progress: {
            orderBy: { date: "asc" },
          },
        },
      });

      if (!goal) return null;

      const percentage =
        goal.targetValue > 0
          ? Math.min(100, Math.max(0, (goal.currentValue / goal.targetValue) * 100))
          : 0;
      const remaining = Math.max(0, goal.targetValue - goal.currentValue);

      let trend: "improving" | "declining" | "stable" = "stable";
      if (goal.progress.length >= 2) {
        const [a, b] = goal.progress.slice(-2);
        if (a && b) {
          if (b.value > a.value) trend = "improving";
          else if (b.value < a.value) trend = "declining";
        }
      }

      return {
        goalId: goal.id,
        percentage,
        remaining,
        trend,
        history: goal.progress,
      };
    }),

  recordProgress: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        goalId: z.string().min(1),
        value: z.number(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      assertUser(ctx, input.userId);
      const goal = await ctx.db.goal.findFirst({
        where: {
          id: input.goalId,
          userId: input.userId,
        },
      });

      if (!goal) throw new Error("Goal not found");

      await ctx.db.goalProgress.create({
        data: {
          goalId: input.goalId,
          value: input.value,
          notes: input.notes,
        },
      });

      const reached = input.value >= goal.targetValue;

      const updated = await ctx.db.goal.update({
        where: { id: input.goalId, userId: input.userId },
        data: {
          currentValue: input.value,
          ...(reached && {
            status: "completed" as const,
            completedAt: new Date(),
          }),
        },
        include: { exercise: { select: { id: true, name: true } } },
      });

      return updated;
    }),

  recordProgressForExercise: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        exerciseId: z.string().min(1),
        weight: z.number().optional(),
        reps: z.number().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      assertUser(ctx, input.userId);
      const goals = await ctx.db.goal.findMany({
        where: {
          userId: input.userId,
          status: "active",
          exerciseId: input.exerciseId,
        },
      });

      const updatedGoalIds: string[] = [];
      const notes = input.notes ?? `From workout set on ${new Date().toLocaleDateString()}`;

      for (const goal of goals) {
        let value: number | null = null;
        if (goal.type === "strength" && input.weight != null) value = input.weight;
        if (goal.type === "reps" && input.reps != null) value = input.reps;
        if (value == null || !Number.isFinite(value) || value <= 0) continue;
        if (value <= goal.currentValue) continue;

        await ctx.db.goalProgress.create({
          data: { goalId: goal.id, value, notes },
        });

        const reached = value >= goal.targetValue;
        await ctx.db.goal.update({
          where: { id: goal.id, userId: input.userId },
          data: {
            currentValue: value,
            ...(reached && { status: "completed" as const, completedAt: new Date() }),
          },
        });

        updatedGoalIds.push(goal.id);
      }

      return { updated: updatedGoalIds.length, goalIds: updatedGoalIds };
    }),
});
