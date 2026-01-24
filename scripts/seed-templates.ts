import { PrismaClient } from "@prisma/client";

import { PROGRAM_TEMPLATES } from "../src/lib/program-templates/templates";

const prisma = new PrismaClient();

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/^circuit:\s*/g, "")
    .replace(/[-/]/g, " ")
    .replace(/\bor\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function baseName(value: string): string {
  const withoutParens = value.replace(/\(.*?\)/g, "").trim();
  const splitOnSlash = withoutParens.split(" / ")[0];
  const splitOnOr = splitOnSlash.split(" or ")[0];
  return splitOnOr.replace(/^circuit:\s*/i, "").trim();
}

function matchExercise(
  nameFallback: string,
  exercises: { id: string; name: string; normalized: string }[],
): { id: string; name: string } | null {
  const base = normalizeName(baseName(nameFallback));
  if (!base) return null;

  const exact = exercises.find((ex) => ex.normalized === base);
  if (exact) return exact;

  const startsWith = exercises.find((ex) => ex.normalized.startsWith(base));
  if (startsWith) return startsWith;

  const includes = exercises.find((ex) => ex.normalized.includes(base));
  if (includes) return includes;

  return null;
}

async function main() {
  const exerciseRows = await prisma.exercise.findMany({
    select: { id: true, name: true },
  });
  const exercises = exerciseRows.map((ex) => ({
    ...ex,
    normalized: normalizeName(ex.name),
  }));

  await prisma.template.deleteMany();

  let matched = 0;
  let total = 0;
  const missing: Array<{ templateId: string; exercise: string }> = [];

  for (const template of PROGRAM_TEMPLATES) {
    await prisma.template.create({
      data: {
        id: template.id,
        name: template.name,
        description: template.description,
        tags: template.tags,
        daysPerWeek: template.daysPerWeek,
        weeks: template.weeks ?? null,
        days: {
          create: template.plan.days.map((day) => ({
            label: day.label,
            day: day.day,
            order: day.day,
            isRestDay: day.isRestDay ?? false,
            items: {
              create: day.items.map((item) => {
                total += 1;
                const fallbackName = item.nameFallback ?? "Exercise";
                const match = item.nameFallback
                  ? matchExercise(item.nameFallback, exercises)
                  : null;
                if (match) matched += 1;
                else missing.push({ templateId: template.id, exercise: fallbackName });

                return {
                  exerciseId: match?.id ?? null,
                  nameFallback: item.nameFallback ?? null,
                  sets: item.sets,
                  reps: item.reps,
                  weight: item.weight ?? null,
                  order: item.order,
                };
              }),
            },
          })),
        },
      },
    });
  }

  const pct = total ? Math.round((matched / total) * 100) : 0;
  console.log(`Seeded ${PROGRAM_TEMPLATES.length} templates.`);
  console.log(`Matched ${matched}/${total} exercises (${pct}%).`);
  if (missing.length > 0) {
    console.log("Missing matches:");
    for (const entry of missing.slice(0, 50)) {
      console.log(`- ${entry.templateId}: ${entry.exercise}`);
    }
    if (missing.length > 50) {
      console.log(`...and ${missing.length - 50} more`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
