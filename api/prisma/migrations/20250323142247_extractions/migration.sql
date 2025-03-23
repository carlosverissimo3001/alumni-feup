-- AlterTable
ALTER TABLE "course_extraction" ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "parsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parsed_at" TIMESTAMP(6);
