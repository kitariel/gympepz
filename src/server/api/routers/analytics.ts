import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { auth } from "@/server/auth";

export const analyticsRouter = createTRPCRouter({
  logPageView: publicProcedure
    .input(
      z.object({
        path: z.string(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await auth();
      const userId = session?.user?.id;

      await ctx.db.pageView.create({
        data: {
          path: input.path,
          userAgent: input.userAgent,
          userId: userId ?? null,
        },
      });

      return { success: true };
    }),

  getStats: publicProcedure
    .input(
      z.object({
        path: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where = input?.path ? { path: input.path } : {};
      
      const [totalViews, uniqueVisitors] = await Promise.all([
        ctx.db.pageView.count({ where }),
        ctx.db.pageView.groupBy({
          by: ["userId"],
          where: {
            ...where,
            userId: { not: null },
          },
        }).then(groups => groups.length),
      ]);

      return {
        totalViews,
        uniqueVisitors,
      };
    }),
});
