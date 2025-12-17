import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const workoutSetRouter = createTRPCRouter({
  // Create a new set
  create: publicProcedure
    .input(
      z.object({
        workoutLogId: z.string().min(1),
        exerciseId: z.string().min(1),
        setNumber: z.number().min(1),
        targetReps: z.number().optional(),
        targetWeight: z.number().optional(),
        actualReps: z.number().default(0),
        actualWeight: z.number().optional(),
        rpe: z.number().min(1).max(10).optional(),
        restSeconds: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.workoutSet.create({
        data: {
          workoutLogId: input.workoutLogId,
          exerciseId: input.exerciseId,
          setNumber: input.setNumber,
          targetReps: input.targetReps,
          targetWeight: input.targetWeight,
          actualReps: input.actualReps,
          actualWeight: input.actualWeight,
          rpe: input.rpe,
          restSeconds: input.restSeconds,
          notes: input.notes,
        },
      });
    }),

  // Mark set as complete and update actual values
  complete: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        actualReps: z.number().min(0),
        actualWeight: z.number().optional(),
        rpe: z.number().min(1).max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const set = await ctx.db.workoutSet.update({
        where: { id: input.id },
        data: {
          actualReps: input.actualReps,
          actualWeight: input.actualWeight,
          rpe: input.rpe,
          completed: true,
        },
        include: {
          exercise: true,
          workoutLog: true,
        },
      });

      // Check if this is a new PR
      if (input.actualWeight && input.actualReps > 0) {
        const calculated1RM = input.actualWeight * (1 + input.actualReps / 30);
        
        const existingPR = await ctx.db.exercisePR.findUnique({
          where: {
            userId_exerciseId_prType: {
              userId: set.workoutLog.userId,
              exerciseId: set.exerciseId,
              prType: "1RM",
            },
          },
        });

        if (!existingPR || calculated1RM > existingPR.value) {
          await ctx.db.exercisePR.upsert({
            where: {
              userId_exerciseId_prType: {
                userId: set.workoutLog.userId,
                exerciseId: set.exerciseId,
                prType: "1RM",
              },
            },
            update: {
              value: calculated1RM,
              reps: input.actualReps,
              date: new Date(),
              workoutLogId: set.workoutLogId,
            },
            create: {
              userId: set.workoutLog.userId,
              exerciseId: set.exerciseId,
              prType: "1RM",
              value: calculated1RM,
              reps: input.actualReps,
              date: new Date(),
              workoutLogId: set.workoutLogId,
            },
          });
        }
      }

      return set;
    }),

  // Update a set
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        targetReps: z.number().optional(),
        targetWeight: z.number().optional(),
        actualReps: z.number().optional(),
        actualWeight: z.number().optional(),
        rpe: z.number().min(1).max(10).optional(),
        restSeconds: z.number().optional(),
        notes: z.string().optional(),
        completed: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.workoutSet.update({
        where: { id },
        data,
      });
    }),

  // Delete a set
  delete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.workoutSet.delete({
        where: { id: input.id },
      });
    }),

  // Get all sets for an exercise in a workout
  listByExercise: publicProcedure
    .input(
      z.object({
        workoutLogId: z.string().min(1),
        exerciseId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.workoutSet.findMany({
        where: {
          workoutLogId: input.workoutLogId,
          exerciseId: input.exerciseId,
        },
        orderBy: { setNumber: "asc" },
        include: {
          exercise: true,
        },
      });
    }),

  // Get all sets for a workout
  listByWorkout: publicProcedure
    .input(z.object({ workoutLogId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.workoutSet.findMany({
        where: { workoutLogId: input.workoutLogId },
        orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
        include: {
          exercise: true,
        },
      });
    }),

  // Duplicate a set (for adding another set with same target)
  duplicate: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const originalSet = await ctx.db.workoutSet.findUnique({
        where: { id: input.id },
      });

      if (!originalSet) {
        throw new Error("Set not found");
      }

      // Find the highest set number for this exercise in this workout
      const highestSet = await ctx.db.workoutSet.findFirst({
        where: {
          workoutLogId: originalSet.workoutLogId,
          exerciseId: originalSet.exerciseId,
        },
        orderBy: { setNumber: "desc" },
      });

      const newSetNumber = (highestSet?.setNumber ?? 0) + 1;

      return ctx.db.workoutSet.create({
        data: {
          workoutLogId: originalSet.workoutLogId,
          exerciseId: originalSet.exerciseId,
          setNumber: newSetNumber,
          targetReps: originalSet.targetReps,
          targetWeight: originalSet.targetWeight,
          actualReps: 0,
          restSeconds: originalSet.restSeconds,
        },
      });
    }),
});
