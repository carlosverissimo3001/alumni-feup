/*
  Warnings:

  - You are about to drop the column `status` on the `course_extraction` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `graduation` table. All the data in the column will be lost.
  - Made the column `conclusion_year` on table `graduation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "course_extraction" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "graduation" DROP COLUMN "status",
ALTER COLUMN "conclusion_year" SET NOT NULL;

-- DropEnum
DROP TYPE "GRADUATION_STATUS";
