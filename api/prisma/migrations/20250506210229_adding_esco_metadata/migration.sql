/*
  Warnings:

  - You are about to drop the column `job_classification_id` on the `role` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "esco_classification" ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isLeaf" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "role" DROP COLUMN "job_classification_id";
