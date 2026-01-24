import { PrismaClient } from "@prisma/client";

import { GOAL_TEMPLATES } from "../src/server/data/goal-templates";

const prisma = new PrismaClient();

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[-/]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchExercise(
  nameFallback: string,
  exercises: { id: string; name: string; normalized: string }[],
): { id: string; name: string } | null {
  const base = normalizeName(nameFallback);
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

  await prisma.goalTemplate.deleteMany();

  let matched = 0;
  let total = 0;
  const missing: Array<{ templateId: string; exercise: string }> = [];

  for (const template of GOAL_TEMPLATES) {
    total += 1;
    const match = template.exerciseName
      ? matchExercise(template.exerciseName, exercises)
      : null;
    if (match) matched += 1;
    if (template.exerciseName && !match) {
      missing.push({ templateId: template.id, exercise: template.exerciseName });
    }

    await prisma.goalTemplate.create({
      data: {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        icon: template.icon,
        type: template.type,
        exerciseId: match?.id ?? null,
        exerciseName: template.exerciseName ?? null,
        targetValue: template.targetValue,
        unit: template.unit,
        suggestedDeadlineDays: template.suggestedDeadlineDays ?? null,
      },
    });
  }

  const pct = total ? Math.round((matched / total) * 100) : 0;
  console.log(`Seeded ${GOAL_TEMPLATES.length} goal templates.`);
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
