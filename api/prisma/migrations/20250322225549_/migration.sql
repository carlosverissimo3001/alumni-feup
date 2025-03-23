/*
  Warnings:

  - You are about to drop the column `status` on the `company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "company" DROP COLUMN "status";

-- DropEnum
DROP TYPE "COMPANY_STATUS";
