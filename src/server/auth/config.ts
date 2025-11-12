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
        const { email, password } = parsed.data;

        const user = await db.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        if (user.lockUntil && new Date(user.lockUntil).getTime() > Date.now()) {
          // Deny login while locked
          return null;
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
          const attempts = (user.failedLoginAttempts ?? 0) + 1;
          let lockUntil: Date | null = null;
          if (attempts >= 5) {
            lockUntil = new Date(Date.now() + 15 * 60_000);
          }
          await db.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: attempts, lockUntil },
          });
          return null;
        }

        if (user.status !== "active") {
          return null;
        }

        // Reset counters on success
        await db.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, lockUntil: null },
        });

        return { id: user.id, email: user.email };
      },
    }),
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
} satisfies NextAuthConfig;
