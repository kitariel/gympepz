import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const locationRouter = createTRPCRouter({
  getByUserEmail: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const sessionEmail = ctx.session?.user?.email?.toLowerCase() ?? null;
      if (!sessionEmail || sessionEmail !== input.email.toLowerCase()) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const user = await ctx.db.user.findUnique({
        where: { email: input.email.toLowerCase() },
        select: { id: true },
      });
      if (!user) return null;
      const loc = await ctx.db.userLocation.findUnique({
        where: { userId: user.id },
      });
      if (!loc) return null;
      return {
        id: loc.id,
        userId: loc.userId,
        country: loc.country ?? null,
        region: loc.region ?? null,
      };
    }),

  upsertByUserEmail: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        country: z.string().min(1),
        region: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sessionEmail = ctx.session?.user?.email?.toLowerCase() ?? null;
      if (!sessionEmail || sessionEmail !== input.email.toLowerCase()) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const email = input.email.toLowerCase();
      const user = await ctx.db.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (!user) return { ok: false };
      const up = await ctx.db.userLocation.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          country: input.country,
          region: input.region ?? null,
        },
        update: {
          country: input.country,
          region: input.region ?? null,
        },
      });
      return {
        ok: true,
        id: up.id,
        userId: up.userId,
        country: up.country ?? null,
        region: up.region ?? null,
      };
    }),
});
