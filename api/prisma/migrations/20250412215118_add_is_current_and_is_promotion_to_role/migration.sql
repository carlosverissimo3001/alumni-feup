-- AlterTable
ALTER TABLE "role" ADD COLUMN     "is_current" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_promotion" BOOLEAN NOT NULL DEFAULT false;
