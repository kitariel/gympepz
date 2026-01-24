import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const templateRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const templates = await ctx.db.template.findMany({
      where: { published: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        tags: true,
        daysPerWeek: true,
      },
    });
    return templates;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const template = await ctx.db.template.findUnique({
        where: { id: input.id },
        include: {
          days: {
            orderBy: { order: "asc" },
            include: {
              items: {
                orderBy: { order: "asc" },
                include: { exercise: { select: { id: true, name: true } } },
              },
            },
          },
        },
      });

      if (!template || !template.published) return null;

      return template;
    }),
});
