/*
  Warnings:

  - You are about to drop the column `crunchbase_url` on the `company` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "COMPANY_TYPE" AS ENUM ('EDUCATIONAL', 'GOVERNMENT_AGENCY', 'NON_PROFIT', 'PARTNERSHIP', 'PRIVATELY_HELD', 'PUBLIC_COMPANY', 'SELF_EMPLOYED', 'SELF_OWNED');

-- AlterTable
ALTER TABLE "company" DROP COLUMN "crunchbase_url",
ADD COLUMN     "company_type" "COMPANY_TYPE";
