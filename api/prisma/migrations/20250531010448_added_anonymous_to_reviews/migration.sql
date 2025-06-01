-- AlterTable
ALTER TABLE "review_company" ADD COLUMN     "anonymous" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "review_location" ADD COLUMN     "anonymous" BOOLEAN NOT NULL DEFAULT true;
