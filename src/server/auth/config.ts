import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { db } from "@/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      status?: string | null;
    } & DefaultSession["user"];
  }
}

const CredsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = CredsSchema.safeParse(raw ?? {});
        if (!parsed.success) return null;
        const email = parsed.data.email.trim().toLowerCase();
        const password = parsed.data.password.trim();

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        // If user exists but has no password yet, instruct client to complete registration
        if (!user.passwordHash) {
          throw new Error("NO_PASSWORD");
        }

        // Account lock check
        if (user.lockUntil && new Date(user.lockUntil).getTime() > Date.now()) {
          throw new Error("LOCKED");
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
          const attempts = (user.failedLoginAttempts ?? 0) + 1;
          let lockUntil: Date | null = null;
          const MAX_FAILED_ATTEMPTS = 5;
          const LOCK_MINUTES = 15;
          if (attempts >= MAX_FAILED_ATTEMPTS) {
            lockUntil = new Date(Date.now() + LOCK_MINUTES * 60_000);
          }
          await db.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: lockUntil ? 0 : attempts, lockUntil },
          });
          throw new Error("INVALID_CREDENTIALS");
        }

        if (user.status !== "active") {
          throw new Error("INACTIVE");
        }

        // Reset counters on success
        await db.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, lockUntil: null },
        });

        // Return minimal user data required by NextAuth (id and email)
        return { id: user.id, email: user.email ?? null };
      },
    }),
  ],
  callbacks: {
    async jwt({ token }) {
      // Keep JWT minimal; NextAuth will set token.sub and token.email.
      return token;
    },
    async session({ session }) {
      // Populate id and status on session.user by looking up the user by email
      const email = session.user?.email ?? null;
      if (email) {
        const dbUser = await db.user.findUnique({
          where: { email },
          select: { id: true, status: true },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.status = dbUser.status ?? null;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
