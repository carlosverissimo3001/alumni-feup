/*
  Warnings:

  - Made the column `created_by` on table `alumni` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `alumni` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Source" AS ENUM ('FORM_SUBMISSION', 'ADMIN_IMPORT');

-- AlterTable
ALTER TABLE "alumni" ADD COLUMN     "source" "Source",
ALTER COLUMN "created_by" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
