/**
 * Migration script to backfill the `day` field in PlanDay table
 * 
 * This script updates all existing PlanDay records to set the `day` field
 * based on their `order` value:
 * - order 0 = "Sunday"
 * - order 1 = "Monday"
 * - order 2 = "Tuesday"
 * - order 3 = "Wednesday"
 * - order 4 = "Thursday"
 * - order 5 = "Friday"
 * - order 6 = "Saturday"
 * - order 7 = "Saturday" (treat as Saturday)
 * - order > 7 = null
 * 
 * Usage:
 *   npm run db:migrate:plan-day
 *   or
 *   npx tsx scripts/migrate-plan-day-field.ts
 */

import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

// Create Prisma client instance
const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

async function migratePlanDayField() {
  console.log("🚀 Starting PlanDay migration...\n");

  try {
    // Day names for order 0-6 (Sunday-Saturday)
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Get all plans
    const plans = await prisma.plan.findMany({
      select: {
        id: true,
        name: true,
        days: {
          select: {
            id: true,
            order: true,
            title: true,
          },
        },
      },
    });

    console.log(`📊 Found ${plans.length} plans to process\n`);

    let updated = 0;
    let created = 0;
    let skipped = 0;
    let errors = 0;

    // Process each plan
    for (const plan of plans) {
      try {
        console.log(`\n📋 Processing plan: "${plan.name}" (${plan.id})`);
        
        // Get existing days by order
        const existingDaysByOrder = new Map(
          plan.days.map((d) => [d.order, d])
        );

        // Ensure all 7 days exist (Sunday-Saturday, order 0-6)
        for (let order = 0; order < 7; order++) {
          const dayName = dayNames[order]!;
          const existingDay = existingDaysByOrder.get(order);

          if (existingDay) {
            // Day exists - update the day field if needed
            try {
              // Check current day value
              const currentDayResult = await prisma.$queryRaw<Array<{ day: string | null }>>`
                SELECT day FROM "PlanDay" WHERE id = ${existingDay.id}
              `;
              const currentDay = currentDayResult[0];
              
              // Skip if day is already set and matches expected value
              if (currentDay?.day === dayName) {
                skipped++;
                console.log(`   ⏭️  Day ${order} (${dayName}) already has correct day field`);
                continue;
              }

              // Update the PlanDay with the day field
              await prisma.$executeRaw`
                UPDATE "PlanDay" 
                SET day = ${dayName}
                WHERE id = ${existingDay.id}
              `;

              updated++;
              console.log(
                `   ✅ Updated Day ${order} (${dayName}) - "${existingDay.title}" -> day: ${dayName}`,
              );
            } catch (error) {
              errors++;
              console.error(
                `   ❌ Error updating Day ${order} (${dayName}):`,
                error instanceof Error ? error.message : error,
              );
            }
          } else {
            // Day doesn't exist - create it with title "N/A"
            try {
              await prisma.$executeRaw`
                INSERT INTO "PlanDay" (id, "planId", title, "order", day, "isRestDay", "createdAt", "updatedAt")
                VALUES (
                  ${randomUUID()},
                  ${plan.id},
                  'N/A',
                  ${order},
                  ${dayName},
                  false,
                  NOW(),
                  NOW()
                )
              `;

              created++;
              console.log(
                `   🆕 Created Day ${order} (${dayName}) with title "N/A" for plan "${plan.name}"`,
              );
            } catch (error) {
              errors++;
              console.error(
                `   ❌ Error creating Day ${order} (${dayName}):`,
                error instanceof Error ? error.message : error,
              );
            }
          }
        }
      } catch (error) {
        errors++;
        console.error(
          `❌ Error processing plan ${plan.id}:`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    // Get final count
    const totalPlanDays = await prisma.planDay.count();

    console.log("\n" + "=".repeat(50));
    console.log("📈 Migration Summary:");
    console.log(`   🆕 Created: ${created}`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped (already set): ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📊 Total Plans Processed: ${plans.length}`);
    console.log(`   📊 Total PlanDays After Migration: ${totalPlanDays}`);
    console.log("=".repeat(50));

    if (errors === 0) {
      console.log("\n🎉 Migration completed successfully!");
    } else {
      console.log("\n⚠️  Migration completed with errors. Please review the output above.");
    }
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migratePlanDayField()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

