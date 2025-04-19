/*
  Warnings:

  - A unique constraint covering the columns `[hq_location_id]` on the table `company` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "company" ADD COLUMN     "hq_location_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "company_hq_location_id_key" ON "company"("hq_location_id");

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_hq_location_id_fkey" FOREIGN KEY ("hq_location_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
