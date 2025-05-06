/*
  Warnings:

  - You are about to drop the column `is_in_group` on the `alumni` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "alumni" DROP COLUMN "is_in_group";

-- AlterTable
ALTER TABLE "review_company" ADD COLUMN     "location_id" TEXT;

-- AddForeignKey
ALTER TABLE "review_company" ADD CONSTRAINT "review_company_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
