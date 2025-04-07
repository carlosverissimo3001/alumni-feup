/*
  Warnings:

  - You are about to drop the column `merged_into_id` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `previous_names` on the `company` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "company" DROP CONSTRAINT "company_merged_into_id_fkey";

-- AlterTable
ALTER TABLE "company" DROP COLUMN "merged_into_id",
DROP COLUMN "previous_names";

-- RenameIndex
ALTER INDEX "company_unique_url" RENAME TO "company_linkedin_url_key";
