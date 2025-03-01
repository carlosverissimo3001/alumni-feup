/*
  Warnings:

  - Added the required column `start_year` to the `course` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "COURSE_TYPE" AS ENUM ('INTEGRATED', 'BACHELORS', 'MASTERS', 'DOCTORATE');

-- AlterTable
ALTER TABLE "course" ADD COLUMN     "course_type" "COURSE_TYPE",
ADD COLUMN     "start_year" INTEGER NOT NULL;
