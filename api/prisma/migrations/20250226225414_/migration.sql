/*
  Warnings:

  - Made the column `person_id` on table `Alumni` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Alumni" ALTER COLUMN "person_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Graduation_alumni_id_idx" ON "Graduation"("alumni_id");

-- CreateIndex
CREATE INDEX "Graduation_course_id_idx" ON "Graduation"("course_id");

-- AddForeignKey
ALTER TABLE "Graduation" ADD CONSTRAINT "Graduation_alumni_id_fkey" FOREIGN KEY ("alumni_id") REFERENCES "Alumni"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graduation" ADD CONSTRAINT "Graduation_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
