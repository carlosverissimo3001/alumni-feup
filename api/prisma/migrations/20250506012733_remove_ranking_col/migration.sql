/*
  Warnings:

  - You are about to drop the column `processing_time` on the `job_classification` table. All the data in the column will be lost.
  - You are about to drop the column `ranking` on the `job_classification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "job_classification" DROP COLUMN "processing_time",
DROP COLUMN "ranking",
ADD COLUMN     "metadata" JSONB;
