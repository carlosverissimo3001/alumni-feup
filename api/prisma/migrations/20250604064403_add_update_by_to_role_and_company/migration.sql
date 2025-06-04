-- AlterTable
ALTER TABLE "company" ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "updated_by" TEXT;

-- AlterTable
ALTER TABLE "role" ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "updated_by" TEXT;
