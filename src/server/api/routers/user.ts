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
        image: (user as { image?: string | null }).image ?? null,
        hasPassword: !!(user as { passwordHash?: string | null }).passwordHash,
        emailVerified: (user as { emailVerified?: Date | null }).emailVerified ?? null,
      };
    }),

  updateProfile: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1).max(100).optional(),
        image: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { email, name, image } = input;
      const updated = await ctx.db.user.update({
        where: { email: email.toLowerCase() },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(image !== undefined ? { image } : {}),
        },
      });
      return {
        id: updated.id,
        email: updated.email,
        name: (updated as { name?: string | null }).name ?? null,
        image: (updated as { image?: string | null }).image ?? null,
      };
    }),
});