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
      return ctx.db.workoutLog.update({
        where: { id: input.id },
        data: {
          completed: input.completed ?? true,
          duration: input.duration,
          notes: input.notes,
        },
      });
    }),
});
