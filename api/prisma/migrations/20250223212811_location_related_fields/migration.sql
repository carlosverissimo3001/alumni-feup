/*
  Warnings:

  - You are about to drop the column `region` on the `Location` table. All the data in the column will be lost.
  - Added the required column `country_code` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Alumni" ADD COLUMN     "current_location_id" TEXT;

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "region",
ADD COLUMN     "country_code" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "location_id" TEXT;

-- CreateIndex
CREATE INDEX "Alumni_current_location_id_idx" ON "Alumni"("current_location_id");

-- CreateIndex
CREATE INDEX "Location_country_code_idx" ON "Location"("country_code");

-- CreateIndex
CREATE INDEX "Location_city_country_idx" ON "Location"("city", "country");

-- CreateIndex
CREATE INDEX "Location_latitude_longitude_idx" ON "Location"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Role_location_id_idx" ON "Role"("location_id");

-- AddForeignKey
ALTER TABLE "Alumni" ADD CONSTRAINT "Alumni_current_location_id_fkey" FOREIGN KEY ("current_location_id") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
