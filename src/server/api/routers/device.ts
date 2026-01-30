import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const deviceRouter = createTRPCRouter({
  /**
   * Register or update a device.
   * Called on login or when sync is enabled.
   */
  upsert: protectedProcedure
    .input(
      z.object({
        deviceId: z.string().min(1),
        platform: z.string().min(1),
        browser: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user!.id;

      const device = await ctx.db.userDevice.upsert({
        where: {
          userId_deviceId: {
            userId,
            deviceId: input.deviceId,
          },
        },
        update: {
          platform: input.platform,
          browser: input.browser,
          lastSeenAt: new Date(),
        },
        create: {
          userId,
          deviceId: input.deviceId,
          platform: input.platform,
          browser: input.browser,
        },
      });

      return {
        id: device.id,
        deviceId: device.deviceId,
        platform: device.platform,
        browser: device.browser,
        label: device.label,
        lastSeenAt: device.lastSeenAt.toISOString(),
      };
    }),

  /**
   * List all devices for the current user.
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user!.id;

    const devices = await ctx.db.userDevice.findMany({
      where: { userId },
      orderBy: { lastSeenAt: "desc" },
    });

    return devices.map((d) => ({
      id: d.id,
      deviceId: d.deviceId,
      platform: d.platform,
      browser: d.browser,
      label: d.label,
      createdAt: d.createdAt.toISOString(),
      lastSeenAt: d.lastSeenAt.toISOString(),
    }));
  }),

  /**
   * Rename a device (set custom label).
   */
  rename: protectedProcedure
    .input(
      z.object({
        deviceId: z.string().min(1),
        label: z.string().max(50).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user!.id;

      try {
        const device = await ctx.db.userDevice.update({
          where: {
            userId_deviceId: {
              userId,
              deviceId: input.deviceId,
            },
          },
          data: {
            label: input.label ?? null,
          },
        });

        return {
          id: device.id,
          deviceId: device.deviceId,
          label: device.label,
        };
      } catch {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Device not found",
        });
      }
    }),

  /**
   * Remove a device from the registry.
   */
  remove: protectedProcedure
    .input(
      z.object({
        deviceId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user!.id;

      try {
        await ctx.db.userDevice.delete({
          where: {
            userId_deviceId: {
              userId,
              deviceId: input.deviceId,
            },
          },
        });

        return { success: true };
      } catch {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Device not found",
        });
      }
    }),

  /**
   * Get info for a specific device by deviceId.
   * Used to show friendly names in lock prompts.
   */
  getByDeviceId: protectedProcedure
    .input(
      z.object({
        deviceId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user!.id;

      const device = await ctx.db.userDevice.findUnique({
        where: {
          userId_deviceId: {
            userId,
            deviceId: input.deviceId,
          },
        },
      });

      if (!device) {
        return null;
      }

      return {
        id: device.id,
        deviceId: device.deviceId,
        platform: device.platform,
        browser: device.browser,
        label: device.label,
        displayName: device.label ?? `${device.browser} on ${device.platform}`,
        lastSeenAt: device.lastSeenAt.toISOString(),
      };
    }),
});
