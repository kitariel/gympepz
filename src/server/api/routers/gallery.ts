import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const galleryRouter = createTRPCRouter({
  listByUser: protectedProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if (ctx.session?.user?.id !== input.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return ctx.db.userImage.findMany({
        where: { userId: input.userId },
        orderBy: { createdAt: "desc" },
        take: 200,
      });
    }),

  addMany: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        urls: z.array(z.string().url()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session?.user?.id !== input.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const data = input.urls.map((url) => ({ userId: input.userId, url }));
      await ctx.db.userImage.createMany({ data });
      return { count: data.length };
    }),
});
