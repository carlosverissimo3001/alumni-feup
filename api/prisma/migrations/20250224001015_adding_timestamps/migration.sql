-- AlterTable
ALTER TABLE "Alumni" ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(6),
ADD COLUMN     "updated_by" TEXT;
