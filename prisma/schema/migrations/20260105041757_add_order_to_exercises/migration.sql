-- AlterTable: Add order field to PlanExercise
ALTER TABLE "PlanExercise" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable: Add order field to WorkoutLogExercise
ALTER TABLE "WorkoutLogExercise" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex: Add index for PlanExercise order
CREATE INDEX "PlanExercise_planDayId_order_idx" ON "PlanExercise"("planDayId", "order");

-- CreateIndex: Add index for WorkoutLogExercise order
CREATE INDEX "WorkoutLogExercise_workoutLogId_order_idx" ON "WorkoutLogExercise"("workoutLogId", "order");


