-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('Beginner', 'Intermediate', 'Advanced');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "experienceLevel" "ExperienceLevel",
ADD COLUMN     "fitnessGoal" TEXT;
