/*
  Warnings:

  - You are about to drop the column `year` on the `course_extraction` table. All the data in the column will be lost.
  - Added the required column `conclusion_year` to the `course_extraction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "course_extraction" DROP COLUMN "year",
ADD COLUMN     "conclusion_year" INTEGER NOT NULL;
