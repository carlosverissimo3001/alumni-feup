/*
  Warnings:

  - The values [INTEGRATED] on the enum `COURSE_TYPE` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "COURSE_TYPE_new" AS ENUM ('INTEGRATED_MASTERS', 'BACHELORS', 'MASTERS', 'DOCTORATE');
ALTER TABLE "course" ALTER COLUMN "course_type" TYPE "COURSE_TYPE_new" USING ("course_type"::text::"COURSE_TYPE_new");
ALTER TYPE "COURSE_TYPE" RENAME TO "COURSE_TYPE_old";
ALTER TYPE "COURSE_TYPE_new" RENAME TO "COURSE_TYPE";
DROP TYPE "COURSE_TYPE_old";
COMMIT;
