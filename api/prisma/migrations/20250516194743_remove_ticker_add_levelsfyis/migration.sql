/*
  Warnings:

  - You are about to drop the column `market_cap` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `ticker` on the `company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "company" DROP COLUMN "market_cap",
DROP COLUMN "ticker",
ADD COLUMN     "levels_fyi_url" TEXT;
