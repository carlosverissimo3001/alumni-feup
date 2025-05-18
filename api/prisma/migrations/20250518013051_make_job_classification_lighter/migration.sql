/*
  Warnings:

  - You are about to drop the column `esco_code` on the `job_classification` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `job_classification` table. All the data in the column will be lost.
  - Made the column `esco_classification_id` on table `job_classification` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "job_classification" DROP CONSTRAINT "job_classification_esco_classification_id_fkey";

-- DropIndex
DROP INDEX "job_classification_title_idx";

-- AlterTable
ALTER TABLE "job_classification" DROP COLUMN "esco_code",
DROP COLUMN "title",
ALTER COLUMN "esco_classification_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "job_classification_esco_classification_id_idx" ON "job_classification"("esco_classification_id");

-- AddForeignKey
ALTER TABLE "job_classification" ADD CONSTRAINT "job_classification_esco_classification_id_fkey" FOREIGN KEY ("esco_classification_id") REFERENCES "esco_classification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
