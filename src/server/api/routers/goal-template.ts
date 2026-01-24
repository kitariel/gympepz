import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const goalTemplateRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const templates = await ctx.db.goalTemplate.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        icon: true,
        type: true,
        exerciseId: true,
        exerciseName: true,
        targetValue: true,
        unit: true,
        suggestedDeadlineDays: true,
      },
    });
    return templates;
  }),
});
