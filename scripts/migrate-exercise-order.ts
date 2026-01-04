/**
 * Migration script to backfill the `order` field in PlanExercise and WorkoutLogExercise tables
 * 
 * This script updates all existing exercise records to set the `order` field
 * based on their creation order.
 * 
 * For PlanExercise: Orders exercises within each PlanDay by id (CUIDs are time-ordered)
 * For WorkoutLogExercise: Orders exercises within each WorkoutLog by createdAt
 * 
 * Usage:
 *   npm run db:migrate:exercise-order
 *   or
 *   npx tsx scripts/migrate-exercise-order.ts
 */

import { PrismaClient } from "@prisma/client";

// Create Prisma client instance
const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

async function migrateExerciseOrder() {
  console.log("🚀 Starting Exercise Order migration...\n");

  try {
    let planExerciseCount = 0;
    let workoutLogExerciseCount = 0;

    // Migrate PlanExercise order
    console.log("📋 Migrating PlanExercise order...");
    const planDays = await prisma.planDay.findMany({
      include: {
        items: {
          orderBy: { id: "asc" }, // CUIDs are time-ordered, so this preserves creation order
        },
      },
    });

    for (const day of planDays) {
      if (day.items.length > 0) {
        await prisma.$transaction(
          day.items.map((item, index) =>
            prisma.$executeRaw`
              UPDATE "PlanExercise"
              SET "order" = ${index}
              WHERE "id" = ${item.id}
            `
          )
        );
        planExerciseCount += day.items.length;
        console.log(`  ✓ Updated ${day.items.length} exercises for "${day.title}" (Plan: ${day.planId})`);
      }
    }

    console.log(`\n✅ Migrated ${planExerciseCount} PlanExercise records\n`);

    // Migrate WorkoutLogExercise order
    console.log("💪 Migrating WorkoutLogExercise order...");
    const workoutLogs = await prisma.workoutLog.findMany({
      include: {
        exercises: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    for (const log of workoutLogs) {
      if (log.exercises.length > 0) {
        await prisma.$transaction(
          log.exercises.map((exercise, index) =>
            prisma.$executeRaw`
              UPDATE "WorkoutLogExercise"
              SET "order" = ${index}
              WHERE "id" = ${exercise.id}
            `
          )
        );
        workoutLogExerciseCount += log.exercises.length;
        console.log(`  ✓ Updated ${log.exercises.length} exercises for WorkoutLog ${log.id}`);
      }
    }

    console.log(`\n✅ Migrated ${workoutLogExerciseCount} WorkoutLogExercise records\n`);

    console.log("🎉 Migration completed successfully!");
    console.log(`\nSummary:`);
    console.log(`  - PlanExercise: ${planExerciseCount} records`);
    console.log(`  - WorkoutLogExercise: ${workoutLogExerciseCount} records`);
    console.log(`  - Total: ${planExerciseCount + workoutLogExerciseCount} records`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateExerciseOrder()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Error:", error);
    process.exit(1);
  });


