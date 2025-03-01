/*
  Warnings:

  - You are about to drop the column `institutional_email` on the `Alumni` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "GRADUATION_STATUS" ADD VALUE 'NOT_ENROLLED';

-- AlterTable
ALTER TABLE "Alumni" DROP COLUMN "institutional_email",
ADD COLUMN     "student_id" TEXT;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "faculty_id" TEXT,
ADD COLUMN     "name_int" TEXT;

-- CreateTable
CREATE TABLE "Faculty_Extraction" (
    "id" TEXT NOT NULL,
    "faculty_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "status" "GRADUATION_STATUS" NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "Faculty_Extraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Faculty_Extraction" ADD CONSTRAINT "Faculty_Extraction_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faculty_Extraction" ADD CONSTRAINT "Faculty_Extraction_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
