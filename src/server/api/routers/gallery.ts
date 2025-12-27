import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const galleryRouter = createTRPCRouter({
  listByUser: publicProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.userImage.findMany({
        where: { userId: input.userId },
        orderBy: { createdAt: "desc" },
        take: 200,
      });
    }),

  addMany: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        urls: z.array(z.string().url()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data = input.urls.map((url) => ({ userId: input.userId, url }));
      await ctx.db.userImage.createMany({ data });
      return { count: data.length };
    }),
});
