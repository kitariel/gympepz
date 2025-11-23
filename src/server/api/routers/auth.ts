import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Helpers
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const RegisterInput = z.object({
  email: z.string().email(),
});

const VerifyOtpInput = z.object({
  email: z.string().email(),
  otp: z.string().min(6).max(6),
});

const SetPasswordInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authRouter = createTRPCRouter({
  // Initiate registration or OTP resend
  register: publicProcedure
    .input(RegisterInput)
    .mutation(async ({ ctx, input }) => {
      const email = input.email.trim().toLowerCase();
      const existing = await ctx.db.user.findUnique({ where: { email } });

      // Existing account with password -> prompt password login
      if (existing?.passwordHash) {
        return { status: "exists_with_password" as const };
      }

      // Existing account without password
      if (existing) {
        // If email already verified (e.g., via Google), skip OTP and go to password set
        if (existing.emailVerified) {
          return { status: "verified_no_password" as const };
        }
        // Rate-limit OTP requests: block if requested < 60s ago
        if (
          existing.otpRequestedAt &&
          new Date(existing.otpRequestedAt).getTime() > Date.now() - 60_000
        ) {
          return { status: "rate_limited" as const, retryAfterSeconds: 60 };
        }

        const code = generateOTP();
        const hash = await bcrypt.hash(code, 10);
        const expires = new Date(Date.now() + 10 * 60_000);

        await ctx.db.user.update({
          where: { id: existing.id },
          data: {
            otpCodeHash: hash,
            otpExpiresAt: expires,
            otpRequestedAt: new Date(),
            otpVerifyAttempts: 0,
            otpVerifyLockUntil: null,
            status: "otp_sent",
          },
        });

        // Simulate email sending: log and return the OTP
        console.log(`[OTP] ${email}: ${code} (expires at ${expires.toISOString()})`);
        return { status: "exists_no_password" as const, otp: code };
      }

      // New user -> create and send OTP
      const code = generateOTP();
      const hash = await bcrypt.hash(code, 10);
      const expires = new Date(Date.now() + 10 * 60_000);

      await ctx.db.user.create({
        data: {
          email,
          otpCodeHash: hash,
          otpExpiresAt: expires,
          otpRequestedAt: new Date(),
          otpVerifyAttempts: 0,
          otpVerifyLockUntil: null,
          status: "otp_sent",
        },
      });

      // Simulate email sending for testing: log and return the OTP
      console.log(`[OTP] ${email}: ${code} (expires at ${expires.toISOString()})`);

      return { status: "otp_sent" as const, otp: code };
    }),

  verifyOtp: publicProcedure
    .input(VerifyOtpInput)
    .mutation(async ({ ctx, input }) => {
      const email = input.email.trim().toLowerCase();
      const { otp } = input;
      const user = await ctx.db.user.findUnique({ where: { email } });
      if (!user) {
        return { status: "not_found" as const };
      }

      // Check if OTP verification is locked
      if (user.otpVerifyLockUntil && new Date(user.otpVerifyLockUntil).getTime() > Date.now()) {
        const secsLeft = Math.ceil((new Date(user.otpVerifyLockUntil).getTime() - Date.now()) / 1000);
        return { status: "otp_locked" as const, retryAfterSeconds: secsLeft };
      }

      if (!user.otpExpiresAt || new Date(user.otpExpiresAt).getTime() < Date.now()) {
        return { status: "otp_expired" as const };
      }
      if (!user.otpCodeHash) {
        return { status: "no_otp" as const };
      }

      const ok = await bcrypt.compare(otp, user.otpCodeHash);
      if (!ok) {
        const attempts = (user.otpVerifyAttempts ?? 0) + 1;
        let lockUntil: Date | null = null;
        const MAX_OTP_ATTEMPTS = 5;
        const LOCK_MINUTES_OTP = 10;
        if (attempts >= MAX_OTP_ATTEMPTS) {
          lockUntil = new Date(Date.now() + LOCK_MINUTES_OTP * 60_000);
        }
        await ctx.db.user.update({
          where: { id: user.id },
          data: {
            otpVerifyAttempts: lockUntil ? 0 : attempts,
            otpVerifyLockUntil: lockUntil,
          },
        });
        return { status: "otp_invalid" as const };
      }

      await ctx.db.user.update({
        where: { id: user.id },
        data: {
          status: "not_active", // internal status; client can treat as verified_pending_password
          otpCodeHash: null,
          otpExpiresAt: null,
          otpRequestedAt: null,
          otpVerifyAttempts: 0,
          otpVerifyLockUntil: null,
        },
      });

      return { status: "verified_pending_password" as const };
    }),

  setPassword: publicProcedure
    .input(SetPasswordInput)
    .mutation(async ({ ctx, input }) => {
      const email = input.email.trim().toLowerCase();
      const password = input.password.trim();
      const user = await ctx.db.user.findUnique({ where: { email } });
      if (!user) {
        return { status: "not_found" as const };
      }

      const hash = await bcrypt.hash(password, 12);
      await ctx.db.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hash,
          status: "active",
          otpCodeHash: null,
          otpExpiresAt: null,
          otpRequestedAt: null,
          otpVerifyAttempts: 0,
          otpVerifyLockUntil: null,
        },
      });

      return { status: "password_set" as const };
    }),
});