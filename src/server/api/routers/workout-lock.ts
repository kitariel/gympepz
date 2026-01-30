import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";

// Lock is considered stale after 90 seconds without heartbeat
const LOCK_STALE_THRESHOLD_MS = 90 * 1000;

// Helper to check if error is a unique constraint violation
function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

// Lock acquisition result types
type AcquireResult =
  | { status: "acquired"; lockId: string; sessionId: string }
  | { status: "already_owned"; lockId: string; sessionId: string }
  | {
      status: "blocked";
      lockedByDevice: string;
      startedAt: string;
      lastHeartbeat: string;
      programName: string | null;
      dayLabel: string | null;
    }
  | { status: "acquired_stale"; lockId: string; sessionId: string; previousDevice: string };

type TakeoverResult =
  | { status: "taken_over"; lockId: string; sessionId: string }
  | { status: "no_lock_exists" }
  | { status: "already_owned" };

type HeartbeatResult =
  | { status: "ok"; lockId: string }
  | { status: "not_owner"; currentOwner: string | null }
  | { status: "no_lock" };

type ReleaseResult =
  | { status: "released" }
  | { status: "not_owner" }
  | { status: "no_lock" };

type LockStatusResult =
  | {
      hasLock: true;
      isOwner: boolean;
      lockId: string;
      deviceId: string;
      sessionId: string;
      startedAt: string;
      lastHeartbeatAt: string;
      programName: string | null;
      dayLabel: string | null;
      status: string;
      isStale: boolean;
    }
  | { hasLock: false };

export const workoutLockRouter = createTRPCRouter({
  /**
   * Acquire a workout lock for this device.
   * - If no lock exists → ACQUIRED
   * - If lock exists and same device → ALREADY_OWNED
   * - If lock exists but stale (no heartbeat > threshold) → ACQUIRED_STALE (auto-recover)
   * - If lock exists and fresh → BLOCKED
   */
  acquire: protectedProcedure
    .input(
      z.object({
        deviceId: z.string().min(1),
        sessionId: z.string().min(1),
        workoutId: z.string().optional(),
        programName: z.string().optional(),
        dayLabel: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }): Promise<AcquireResult> => {
      const userId = ctx.session.user!.id;
      const now = new Date();

      // Check for existing lock
      const existingLock = await ctx.db.workoutSessionLock.findUnique({
        where: { userId },
      });

      // No lock exists - create new one
      if (!existingLock) {
        try {
          const lock = await ctx.db.workoutSessionLock.create({
            data: {
              userId,
              deviceId: input.deviceId,
              sessionId: input.sessionId,
              workoutId: input.workoutId,
              programName: input.programName,
              dayLabel: input.dayLabel,
              startedAt: now,
              lastHeartbeatAt: now,
              status: "active",
            },
          });
          return { status: "acquired", lockId: lock.id, sessionId: lock.sessionId };
        } catch (error) {
          // Race condition: another device created a lock between our read and write
          if (isUniqueConstraintError(error)) {
            // Re-fetch and return blocked status
            const newLock = await ctx.db.workoutSessionLock.findUnique({
              where: { userId },
            });
            if (newLock) {
              return {
                status: "blocked",
                lockedByDevice: newLock.deviceId,
                startedAt: newLock.startedAt.toISOString(),
                lastHeartbeat: newLock.lastHeartbeatAt.toISOString(),
                programName: newLock.programName,
                dayLabel: newLock.dayLabel,
              };
            }
          }
          throw error;
        }
      }

      // Same device already owns the lock
      if (existingLock.deviceId === input.deviceId) {
        // Update the lock with new session info and heartbeat
        const lock = await ctx.db.workoutSessionLock.update({
          where: { id: existingLock.id },
          data: {
            sessionId: input.sessionId,
            workoutId: input.workoutId,
            programName: input.programName,
            dayLabel: input.dayLabel,
            lastHeartbeatAt: now,
            status: "active",
          },
        });
        return { status: "already_owned", lockId: lock.id, sessionId: lock.sessionId };
      }

      // Check if lock is stale (no heartbeat within threshold)
      const timeSinceHeartbeat = now.getTime() - existingLock.lastHeartbeatAt.getTime();
      if (timeSinceHeartbeat > LOCK_STALE_THRESHOLD_MS) {
        // Lock is stale - take over automatically
        const previousDevice = existingLock.deviceId;
        const lock = await ctx.db.workoutSessionLock.update({
          where: { id: existingLock.id },
          data: {
            deviceId: input.deviceId,
            sessionId: input.sessionId,
            workoutId: input.workoutId,
            programName: input.programName,
            dayLabel: input.dayLabel,
            startedAt: now,
            lastHeartbeatAt: now,
            status: "active",
          },
        });
        return {
          status: "acquired_stale",
          lockId: lock.id,
          sessionId: lock.sessionId,
          previousDevice,
        };
      }

      // Lock is active and owned by another device - blocked
      return {
        status: "blocked",
        lockedByDevice: existingLock.deviceId,
        startedAt: existingLock.startedAt.toISOString(),
        lastHeartbeat: existingLock.lastHeartbeatAt.toISOString(),
        programName: existingLock.programName,
        dayLabel: existingLock.dayLabel,
      };
    }),

  /**
   * Forcefully take over the lock from another device.
   * The previous device will be marked as "taken_over".
   */
  takeover: protectedProcedure
    .input(
      z.object({
        deviceId: z.string().min(1),
        sessionId: z.string().min(1),
        workoutId: z.string().optional(),
        programName: z.string().optional(),
        dayLabel: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }): Promise<TakeoverResult> => {
      const userId = ctx.session.user!.id;
      const now = new Date();

      const existingLock = await ctx.db.workoutSessionLock.findUnique({
        where: { userId },
      });

      if (!existingLock) {
        return { status: "no_lock_exists" };
      }

      if (existingLock.deviceId === input.deviceId) {
        return { status: "already_owned" };
      }

      // Take over the lock
      const lock = await ctx.db.workoutSessionLock.update({
        where: { id: existingLock.id },
        data: {
          deviceId: input.deviceId,
          sessionId: input.sessionId,
          workoutId: input.workoutId,
          programName: input.programName ?? existingLock.programName,
          dayLabel: input.dayLabel ?? existingLock.dayLabel,
          startedAt: now,
          lastHeartbeatAt: now,
          status: "active",
        },
      });

      return { status: "taken_over", lockId: lock.id, sessionId: lock.sessionId };
    }),

  /**
   * Send a heartbeat to keep the lock alive.
   * Should be called every 20-30 seconds during an active workout.
   */
  heartbeat: protectedProcedure
    .input(
      z.object({
        deviceId: z.string().min(1),
        sessionId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }): Promise<HeartbeatResult> => {
      const userId = ctx.session.user!.id;
      const now = new Date();

      const existingLock = await ctx.db.workoutSessionLock.findUnique({
        where: { userId },
      });

      if (!existingLock) {
        return { status: "no_lock" };
      }

      // Verify this device owns the lock
      if (existingLock.deviceId !== input.deviceId) {
        return { status: "not_owner", currentOwner: existingLock.deviceId };
      }

      // Update heartbeat
      const lock = await ctx.db.workoutSessionLock.update({
        where: { id: existingLock.id },
        data: {
          lastHeartbeatAt: now,
          status: "active",
        },
      });

      return { status: "ok", lockId: lock.id };
    }),

  /**
   * Release the lock when workout is finished.
   */
  release: protectedProcedure
    .input(
      z.object({
        deviceId: z.string().min(1),
        sessionId: z.string().optional(),
        force: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }): Promise<ReleaseResult> => {
      const userId = ctx.session.user!.id;

      const existingLock = await ctx.db.workoutSessionLock.findUnique({
        where: { userId },
      });

      if (!existingLock) {
        return { status: "no_lock" };
      }

      // Only owner can release (unless force is true)
      if (!input.force && existingLock.deviceId !== input.deviceId) {
        return { status: "not_owner" };
      }

      // Delete the lock
      await ctx.db.workoutSessionLock.delete({
        where: { id: existingLock.id },
      });

      return { status: "released" };
    }),

  /**
   * Get the current lock status for the user.
   * Used for polling to detect if another device has taken over.
   */
  getStatus: protectedProcedure
    .input(
      z.object({
        deviceId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }): Promise<LockStatusResult> => {
      const userId = ctx.session.user!.id;
      const now = new Date();

      const lock = await ctx.db.workoutSessionLock.findUnique({
        where: { userId },
      });

      if (!lock) {
        return { hasLock: false };
      }

      const timeSinceHeartbeat = now.getTime() - lock.lastHeartbeatAt.getTime();
      const isStale = timeSinceHeartbeat > LOCK_STALE_THRESHOLD_MS;

      return {
        hasLock: true,
        isOwner: lock.deviceId === input.deviceId,
        lockId: lock.id,
        deviceId: lock.deviceId,
        sessionId: lock.sessionId,
        startedAt: lock.startedAt.toISOString(),
        lastHeartbeatAt: lock.lastHeartbeatAt.toISOString(),
        programName: lock.programName,
        dayLabel: lock.dayLabel,
        status: lock.status,
        isStale,
      };
    }),
});
