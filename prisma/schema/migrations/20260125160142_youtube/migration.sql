-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "youtubeVideoIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
