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
});
