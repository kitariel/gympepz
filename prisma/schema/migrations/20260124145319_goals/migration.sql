-- CreateTable
CREATE TABLE "GoalTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "exerciseId" TEXT,
    "exerciseName" TEXT,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "suggestedDeadlineDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoalTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoalTemplate_category_idx" ON "GoalTemplate"("category");

-- CreateIndex
CREATE INDEX "GoalTemplate_type_idx" ON "GoalTemplate"("type");

-- CreateIndex
CREATE INDEX "GoalTemplate_exerciseId_idx" ON "GoalTemplate"("exerciseId");

-- AddForeignKey
ALTER TABLE "GoalTemplate" ADD CONSTRAINT "GoalTemplate_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
