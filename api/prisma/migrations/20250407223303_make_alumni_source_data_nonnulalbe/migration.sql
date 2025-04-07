/*
  Warnings:

  - Made the column `has_sigarra_match` on table `alumni` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_in_group` on table `alumni` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "alumni" ALTER COLUMN "has_sigarra_match" SET NOT NULL,
ALTER COLUMN "is_in_group" SET NOT NULL;
