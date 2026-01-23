/*
  Warnings:

  - You are about to drop the column `activePlanId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `planDayId` on the `WorkoutLog` table. All the data in the column will be lost.
  - You are about to drop the `Plan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlanDay` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlanExercise` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Plan" DROP CONSTRAINT "Plan_userId_fkey";

-- DropForeignKey
ALTER TABLE "PlanDay" DROP CONSTRAINT "PlanDay_planId_fkey";

-- DropForeignKey
ALTER TABLE "PlanExercise" DROP CONSTRAINT "PlanExercise_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "PlanExercise" DROP CONSTRAINT "PlanExercise_planDayId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_activePlanId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutLog" DROP CONSTRAINT "WorkoutLog_planDayId_fkey";

-- DropIndex
DROP INDEX "User_activePlanId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "activePlanId";

-- AlterTable
ALTER TABLE "WorkoutLog" DROP COLUMN "planDayId";

-- DropTable
DROP TABLE "Plan";

-- DropTable
DROP TABLE "PlanDay";

-- DropTable
DROP TABLE "PlanExercise";

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramDay" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "day" INTEGER,
    "isRestDay" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProgramDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramExercise" (
    "id" TEXT NOT NULL,
    "programDayId" TEXT NOT NULL,
    "exerciseId" TEXT,
    "nameFallback" TEXT,
    "sets" INTEGER NOT NULL,
    "reps" TEXT NOT NULL,
    "weight" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProgramExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProgramExercise_programDayId_order_idx" ON "ProgramExercise"("programDayId", "order");

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDay" ADD CONSTRAINT "ProgramDay_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramExercise" ADD CONSTRAINT "ProgramExercise_programDayId_fkey" FOREIGN KEY ("programDayId") REFERENCES "ProgramDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramExercise" ADD CONSTRAINT "ProgramExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
