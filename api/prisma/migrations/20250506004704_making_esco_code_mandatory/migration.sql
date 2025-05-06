/*
  Warnings:

  - Made the column `esco_code` on table `job_classification` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "job_classification" ALTER COLUMN "esco_code" SET NOT NULL;
