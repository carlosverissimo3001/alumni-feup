/*
  Warnings:

  - Added the required column `full_name` to the `course_extraction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "course_extraction" ADD COLUMN     "full_name" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
