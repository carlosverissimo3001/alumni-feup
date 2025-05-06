/*
  Warnings:

  - You are about to drop the `problematic_location` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "problematic_location" DROP CONSTRAINT "problematic_location_location_id_fkey";

-- DropTable
DROP TABLE "problematic_location";
