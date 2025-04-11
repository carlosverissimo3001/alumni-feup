-- AlterTable
ALTER TABLE "role_raw" ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "role_raw_role_id_idx" ON "role_raw"("role_id");
