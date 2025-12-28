import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const locationRouter = createTRPCRouter({
  getByUserEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
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

  upsertByUserEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        country: z.string().min(1),
        region: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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

  searchGyms: publicProcedure
    .input(
      z.object({
        address: z.string().min(1),
        limit: z.number().min(1).max(10).optional(),
      }),
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 5;
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      
      if (!mapboxToken) {
        throw new Error("Mapbox token not configured");
      }

      try {
        // First, geocode the address to get coordinates
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(input.address)}.json?access_token=${mapboxToken}&limit=1`;
        const geocodeRes = await fetch(geocodeUrl);
        const geocodeData = await geocodeRes.json();

        if (!geocodeData.features || geocodeData.features.length === 0) {
          return { gyms: [], error: "Location not found" };
        }

        const [longitude, latitude] = geocodeData.features[0].geometry.coordinates;

        // Search for gyms near the coordinates
        const searchUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/gym.json?proximity=${longitude},${latitude}&access_token=${mapboxToken}&limit=${limit}&types=poi`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        const gyms = searchData.features.map((feature: any) => ({
          name: feature.text || feature.place_name,
          address: feature.place_name,
          distance: feature.properties?.distance || null,
          coordinates: {
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
          },
        }));

        return { gyms, error: null };
      } catch (error) {
        console.error("Error searching gyms:", error);
        return { gyms: [], error: "Failed to search for gyms" };
      }
    }),
});
