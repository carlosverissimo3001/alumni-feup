/*
  Warnings:

  - You are about to drop the `faculty_extraction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "faculty_extraction" DROP CONSTRAINT "faculty_extraction_course_id_fkey";

-- DropForeignKey
ALTER TABLE "faculty_extraction" DROP CONSTRAINT "faculty_extraction_faculty_id_fkey";

-- DropTable
DROP TABLE "faculty_extraction";

-- CreateTable
CREATE TABLE "course_extraction" (
    "id" TEXT NOT NULL,
    "faculty_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "status" "GRADUATION_STATUS" NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "course_extraction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "course_extraction" ADD CONSTRAINT "course_extraction_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_extraction" ADD CONSTRAINT "course_extraction_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
