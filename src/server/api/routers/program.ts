import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

const ProgramExerciseInput = z.object({
  exerciseId: z.string().optional(),
  nameFallback: z.string().optional(),
  sets: z.number().min(0),
  reps: z.string(),
  weight: z.string().nullish(),
  order: z.number().min(0),
});

const ProgramDayInput = z.object({
  day: z.number().min(1).max(7),
  label: z.string(),
  isRestDay: z.boolean().optional(),
  items: z.array(ProgramExerciseInput),
});

const ProgramInput = z.object({
  id: z.string(),
  name: z.string(),
  source: z.enum(["custom", "template"]).default("custom"),
  createdAt: z.string(),
  updatedAt: z.string(),
  plan: z.object({
    days: z.array(ProgramDayInput),
  }),
});

function toDate(value: string): Date {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export const programRouter = createTRPCRouter({
  sync: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        programs: z.array(ProgramInput),
        activeProgramId: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dbPrograms = await ctx.db.program.findMany({
        where: { userId: input.userId },
        include: {
          days: {
            include: { items: true },
            orderBy: { order: "asc" },
          },
        },
      });

      const dbById = new Map(dbPrograms.map((p) => [p.id, p]));
      const localById = new Map(input.programs.map((p) => [p.id, p]));

      const upsertProgram = async (program: z.infer<typeof ProgramInput>) => {
        const exists = dbById.get(program.id);
        if (exists) {
          await ctx.db.programDay.deleteMany({
            where: { programId: program.id },
          });
          await ctx.db.program.update({
            where: { id: program.id },
            data: {
              name: program.name,
              source: program.source,
              createdAt: toDate(program.createdAt),
              updatedAt: toDate(program.updatedAt),
            },
          });
        } else {
          await ctx.db.program.create({
            data: {
              id: program.id,
              userId: input.userId,
              name: program.name,
              source: program.source,
              createdAt: toDate(program.createdAt),
              updatedAt: toDate(program.updatedAt),
            },
          });
        }

        for (const day of program.plan.days) {
          await ctx.db.programDay.create({
            data: {
              programId: program.id,
              label: day.label,
              day: day.day,
              order: day.day,
              isRestDay: day.isRestDay ?? false,
              items: {
                create: day.items.map((item) => ({
                  exerciseId: item.exerciseId ?? null,
                  nameFallback: item.nameFallback ?? null,
                  sets: item.sets,
                  reps: item.reps,
                  weight: item.weight ?? null,
                  order: item.order,
                })),
              },
            },
          });
        }
      };

      for (const program of input.programs) {
        const db = dbById.get(program.id);
        if (!db || toDate(program.updatedAt) > db.updatedAt) {
          await upsertProgram(program);
        }
      }

      const refreshed = await ctx.db.program.findMany({
        where: { userId: input.userId },
        include: {
          days: {
            include: { items: true },
            orderBy: { order: "asc" },
          },
        },
      });

      const pulls = refreshed.filter((db) => {
        const local = localById.get(db.id);
        if (!local) return true;
        return db.updatedAt > toDate(local.updatedAt);
      });

      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: { activeProgramId: true },
      });

      const localActiveId = input.activeProgramId ?? null;
      const dbActiveId = user?.activeProgramId ?? null;
      const localActive = localActiveId ? localById.get(localActiveId) : null;
      const dbActive = dbActiveId ? refreshed.find((p) => p.id === dbActiveId) : null;

      let resolvedActiveId = dbActiveId ?? localActiveId ?? null;
      if (localActive && (!dbActive || toDate(localActive.updatedAt) > dbActive.updatedAt)) {
        resolvedActiveId = localActiveId ?? null;
      } else if (dbActive && (!localActive || dbActive.updatedAt > toDate(localActive.updatedAt))) {
        resolvedActiveId = dbActiveId ?? null;
      }

      if (resolvedActiveId !== dbActiveId) {
        await ctx.db.user.update({
          where: { id: input.userId },
          data: { activeProgramId: resolvedActiveId },
        });
      }

      return {
        programs: pulls.map((program) => ({
          id: program.id,
          name: program.name,
          source: program.source as "custom" | "template",
          createdAt: program.createdAt.toISOString(),
          updatedAt: program.updatedAt.toISOString(),
          plan: {
            days: program.days.map((day) => ({
              day: day.day ?? day.order,
              label: day.label,
              isRestDay: day.isRestDay,
              items: day.items
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((item) => ({
                  exerciseId: item.exerciseId ?? undefined,
                  nameFallback: item.nameFallback ?? undefined,
                  sets: item.sets,
                  reps: item.reps,
                  weight: item.weight ?? undefined,
                  order: item.order,
                })),
            })),
          },
        })),
        activeProgramId: resolvedActiveId,
      };
    }),
});
