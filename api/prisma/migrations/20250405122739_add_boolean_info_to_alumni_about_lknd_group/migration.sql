/*
  Warnings:

  - You are about to drop the column `student_id` on the `alumni` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "alumni" DROP COLUMN "student_id",
ADD COLUMN     "has_sigarra_match" BOOLEAN,
ADD COLUMN     "is_in_group" BOOLEAN;
