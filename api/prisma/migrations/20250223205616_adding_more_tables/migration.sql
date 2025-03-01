/*
  Warnings:

  - Added the required column `acronym` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `course_id` to the `GraduationStatus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "acronym" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GraduationStatus" ADD COLUMN     "course_id" TEXT NOT NULL;
