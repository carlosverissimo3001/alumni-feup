/*
  Warnings:

  - You are about to drop the `course_extraction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "course_extraction" DROP CONSTRAINT "course_extraction_course_id_fkey";

-- DropForeignKey
ALTER TABLE "course_extraction" DROP CONSTRAINT "course_extraction_faculty_id_fkey";

-- DropTable
DROP TABLE "course_extraction";
