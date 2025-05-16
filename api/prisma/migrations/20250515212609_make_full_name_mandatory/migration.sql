/*
  Warnings:

  - Made the column `full_name` on table `alumni` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TREND_TYPE" AS ENUM ('INDUSTRY', 'COMPANY_AVERAGE');

-- CreateEnum
CREATE TYPE "TREND_UNIT" AS ENUM ('MONTH', 'QUARTER', 'SEMESTER', 'YEAR');

-- AlterTable
ALTER TABLE "alumni" ALTER COLUMN "full_name" SET NOT NULL;

-- CreateTable
CREATE TABLE "Trend" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "entity_name" TEXT NOT NULL,
    "type" "TREND_TYPE" NOT NULL,
    "unit" "TREND_UNIT" NOT NULL DEFAULT 'MONTH',
    "init_label" TEXT NOT NULL,
    "end_label" TEXT NOT NULL,
    "trend" INTEGER[],
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trend_pkey" PRIMARY KEY ("id")
);
