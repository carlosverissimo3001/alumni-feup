-- AlterTable
ALTER TABLE "role" ADD COLUMN     "source_fingerprint" TEXT,
ADD COLUMN     "source_company_url" TEXT,
ADD COLUMN     "source_missing_since" TIMESTAMPTZ(6);

-- CreateIndex
-- Nullable, so pre-existing rows (source_fingerprint = null) aren't
-- constrained - Postgres treats each NULL as distinct under a unique index.
CREATE UNIQUE INDEX "role_alumni_id_source_fingerprint_key" ON "role"("alumni_id", "source_fingerprint");
