import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const listingsRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        ownerId: z.string().min(1),
        title: z.string().min(1),
        category: z.string().min(1),
        address: z.string().min(1),
        latitude: z.number(),
        longitude: z.number(),
        shortDescription: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().url().optional(),
        imageUrls: z.array(z.string().url()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const created = await ctx.db.listing.create({
        data: {
          ownerId: input.ownerId,
          title: input.title,
          category: input.category,
          address: input.address,
          latitude: input.latitude,
          longitude: input.longitude,
          shortDescription: input.shortDescription,
          phone: input.phone,
          website: input.website,
          imageUrls: input.imageUrls ?? [],
        },
      });
      return created;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        category: z.string().min(1),
        address: z.string().min(1),
        latitude: z.number(),
        longitude: z.number(),
        shortDescription: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().url().optional(),
        imageUrls: z.array(z.string().url()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db.listing.update({
        where: { id: input.id },
        data: {
          title: input.title,
          category: input.category,
          address: input.address,
          latitude: input.latitude,
          longitude: input.longitude,
          shortDescription: input.shortDescription,
          phone: input.phone,
          website: input.website,
          imageUrls: input.imageUrls ?? [],
        },
      });
      return updated;
    }),

  byBounds: publicProcedure
    .input(
      z.object({
        sw: z.object({ lat: z.number(), lng: z.number() }),
        ne: z.object({ lat: z.number(), lng: z.number() }),
        category: z.string().optional(),
        text: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.ListingWhereInput = {
        latitude: { gte: input.sw.lat, lte: input.ne.lat },
        longitude: { gte: input.sw.lng, lte: input.ne.lng },
        ...(input.category ? { category: input.category } : {}),
        ...(input.text
          ? {
              OR: [
                { title: { contains: input.text, mode: "insensitive" as Prisma.QueryMode } },
                { address: { contains: input.text, mode: "insensitive" as Prisma.QueryMode } },
              ],
            }
          : {}),
      };
      const rows = await ctx.db.listing.findMany({ where, take: 500 });
      return rows;
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.listing.findUnique({ where: { id: input.id } });
    }),

  listByOwner: publicProcedure
    .input(z.object({ ownerId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.listing.findMany({
        where: { ownerId: input.ownerId },
        orderBy: { createdAt: "desc" },
      });
    }),
});
