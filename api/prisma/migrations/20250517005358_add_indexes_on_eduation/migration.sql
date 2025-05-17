/*
  Warnings:

  - A unique constraint covering the columns `[alumni_id,course_id,conclusion_year]` on the table `graduation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "course_faculty_id_idx" ON "course"("faculty_id");

-- CreateIndex
CREATE INDEX "course_status_idx" ON "course"("status");

-- CreateIndex
CREATE INDEX "course_course_type_idx" ON "course"("course_type");

-- CreateIndex
CREATE INDEX "graduation_conclusion_year_idx" ON "graduation"("conclusion_year");

-- CreateIndex
CREATE INDEX "graduation_course_id_conclusion_year_idx" ON "graduation"("course_id", "conclusion_year");

-- CreateIndex
CREATE INDEX "graduation_alumni_id_conclusion_year_idx" ON "graduation"("alumni_id", "conclusion_year");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_alumni_id_course_id_conclusion_year_key" ON "graduation"("alumni_id", "course_id", "conclusion_year");
