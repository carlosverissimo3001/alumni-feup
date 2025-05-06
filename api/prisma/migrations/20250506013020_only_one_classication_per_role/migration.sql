/*
  Warnings:

  - A unique constraint covering the columns `[role_id]` on the table `job_classification` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "role" ADD COLUMN     "job_classification_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "job_classification_role_id_key" ON "job_classification"("role_id");
