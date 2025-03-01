/*
  Warnings:

  - You are about to drop the `GraduationStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "GRADUATION_STATUS" ADD VALUE 'EXTERNAL';

-- DropTable
DROP TABLE "GraduationStatus";

-- CreateTable
CREATE TABLE "Graduation" (
    "id" TEXT NOT NULL,
    "alumni_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "status" "GRADUATION_STATUS" NOT NULL,
    "conclusion_year" INTEGER,

    CONSTRAINT "Graduation_pkey" PRIMARY KEY ("id")
);
