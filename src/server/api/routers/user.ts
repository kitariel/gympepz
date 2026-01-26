import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  getByEmail: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const sessionEmail = ctx.session?.user?.email?.toLowerCase() ?? null;
      if (!sessionEmail || sessionEmail !== input.email.toLowerCase()) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
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
        emailVerified:
          (user as { emailVerified?: Date | null }).emailVerified ?? null,
        status: (user as { status?: string | null }).status ?? null,
        createdAt: (user as { createdAt?: Date | null }).createdAt ?? null,
        fitnessGoal: (user as { fitnessGoal?: string | null }).fitnessGoal ?? null,
        experienceLevel: (user as { experienceLevel?: string | null }).experienceLevel ?? null,
        bio: (user as { bio?: string | null }).bio ?? null,
      };
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1).max(100).optional(),
        image: z.string().url().optional(),
        fitnessGoal: z.string().max(200).optional(),
        experienceLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
        bio: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { email, name, image, fitnessGoal, experienceLevel, bio } = input;
      const sessionEmail = ctx.session?.user?.email?.toLowerCase() ?? null;
      if (!sessionEmail || sessionEmail !== email.toLowerCase()) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const updated = await ctx.db.user.update({
        where: { email: email.toLowerCase() },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(image !== undefined ? { image } : {}),
          ...(fitnessGoal !== undefined ? { fitnessGoal } : {}),
          ...(experienceLevel !== undefined ? { experienceLevel } : {}),
          ...(bio !== undefined ? { bio } : {}),
        },
      });
      return {
        id: updated.id,
        email: updated.email,
        name: (updated as { name?: string | null }).name ?? null,
        image: (updated as { image?: string | null }).image ?? null,
        fitnessGoal: (updated as { fitnessGoal?: string | null }).fitnessGoal ?? null,
        experienceLevel: (updated as { experienceLevel?: string | null }).experienceLevel ?? null,
        bio: (updated as { bio?: string | null }).bio ?? null,
      };
    }),

  listSessions: protectedProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const sessionUserId = ctx.session?.user?.id ?? null;
      if (!sessionUserId || sessionUserId !== input.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const sessions = await ctx.db.session.findMany({
        where: { userId: input.userId },
        orderBy: { expires: "desc" },
        select: { id: true, expires: true },
      });
      return sessions.map((s) => ({ id: s.id, expires: s.expires }));
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { email, currentPassword, newPassword } = input;
      const sessionEmail = ctx.session?.user?.email?.toLowerCase() ?? null;
      if (!sessionEmail || sessionEmail !== email.toLowerCase()) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const bcrypt = await import("bcryptjs");
      
      // Find user
      const user = await ctx.db.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const passwordHash = (user as { passwordHash?: string | null }).passwordHash;
      
      if (!passwordHash) {
        throw new Error("No password set");
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, passwordHash);
      if (!isValid) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const newHash = await bcrypt.hash(newPassword, 10);

      // Update password
      await ctx.db.user.update({
        where: { email: email.toLowerCase() },
        data: { passwordHash: newHash },
      });

      return { success: true };
    }),
});
