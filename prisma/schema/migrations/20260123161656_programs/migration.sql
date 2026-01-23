/*
  Warnings:

  - A unique constraint covering the columns `[activeProgramId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'custom';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activeProgramId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_activeProgramId_key" ON "User"("activeProgramId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_activeProgramId_fkey" FOREIGN KEY ("activeProgramId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
