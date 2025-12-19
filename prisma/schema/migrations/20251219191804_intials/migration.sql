-- AlterTable
ALTER TABLE "ProgressEntry" ADD COLUMN     "mood" TEXT,
ADD COLUMN     "neck" DOUBLE PRECISION,
ADD COLUMN     "shoulders" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "WorkoutLog" ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "totalVolume" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "WorkoutSet" (
    "id" TEXT NOT NULL,
    "workoutLogId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "targetReps" INTEGER,
    "actualReps" INTEGER NOT NULL,
    "targetWeight" DOUBLE PRECISION,
    "actualWeight" DOUBLE PRECISION,
    "rpe" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "restSeconds" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExercisePR" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "prType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "reps" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "workoutLogId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExercisePR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutStreak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastWorkout" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutStreak_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkoutSet_workoutLogId_exerciseId_idx" ON "WorkoutSet"("workoutLogId", "exerciseId");

-- CreateIndex
CREATE INDEX "WorkoutSet_workoutLogId_exerciseId_setNumber_idx" ON "WorkoutSet"("workoutLogId", "exerciseId", "setNumber");

-- CreateIndex
CREATE INDEX "ExercisePR_userId_exerciseId_idx" ON "ExercisePR"("userId", "exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "ExercisePR_userId_exerciseId_prType_key" ON "ExercisePR"("userId", "exerciseId", "prType");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutStreak_userId_key" ON "WorkoutStreak"("userId");

-- CreateIndex
CREATE INDEX "Exercise_muscleGroup_difficulty_idx" ON "Exercise"("muscleGroup", "difficulty");

-- CreateIndex
CREATE INDEX "WorkoutLog_userId_date_idx" ON "WorkoutLog"("userId", "date");

-- CreateIndex
CREATE INDEX "WorkoutLogExercise_workoutLogId_exerciseId_idx" ON "WorkoutLogExercise"("workoutLogId", "exerciseId");

-- AddForeignKey
ALTER TABLE "WorkoutSet" ADD CONSTRAINT "WorkoutSet_workoutLogId_fkey" FOREIGN KEY ("workoutLogId") REFERENCES "WorkoutLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSet" ADD CONSTRAINT "WorkoutSet_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExercisePR" ADD CONSTRAINT "ExercisePR_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExercisePR" ADD CONSTRAINT "ExercisePR_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExercisePR" ADD CONSTRAINT "ExercisePR_workoutLogId_fkey" FOREIGN KEY ("workoutLogId") REFERENCES "WorkoutLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutStreak" ADD CONSTRAINT "WorkoutStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
