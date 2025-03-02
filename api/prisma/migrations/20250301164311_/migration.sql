/*
  Warnings:

  - Made the column `course_type` on table `course` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "course" ALTER COLUMN "course_type" SET NOT NULL;
