import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  getByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email.toLowerCase() },
      });
      if (!user) return null;
      // Return a minimal shape to avoid Prisma type mismatches before migration
      return {
        id: user.id,
        email: user.email,
        // Optional fields may be present after migration; guarded access
        name: (user as { name?: string | null }).name ?? null,
        imageUrl: (user as { imageUrl?: string | null }).imageUrl ?? null,
      };
    }),

  updateProfile: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1).max(100).optional(),
        imageUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { email, name, imageUrl } = input;
      const updated = await ctx.db.user.update({
        where: { email: email.toLowerCase() },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(imageUrl !== undefined ? { imageUrl } : {}),
        },
      });
      return {
        id: updated.id,
        email: updated.email,
        name: (updated as { name?: string | null }).name ?? null,
        imageUrl: (updated as { imageUrl?: string | null }).imageUrl ?? null,
      };
    }),
});