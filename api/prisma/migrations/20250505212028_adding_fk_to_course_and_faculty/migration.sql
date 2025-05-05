-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
