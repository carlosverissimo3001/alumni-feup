-- DropForeignKey
ALTER TABLE "graduation" DROP CONSTRAINT "graduation_alumni_id_fkey";

-- DropForeignKey
ALTER TABLE "job_classification" DROP CONSTRAINT "job_classification_role_id_fkey";

-- DropForeignKey
ALTER TABLE "permission" DROP CONSTRAINT "permission_user_id_fkey";

-- DropForeignKey
ALTER TABLE "review_company" DROP CONSTRAINT "review_company_alumni_id_fkey";

-- DropForeignKey
ALTER TABLE "review_location" DROP CONSTRAINT "review_location_alumni_id_fkey";

-- DropForeignKey
ALTER TABLE "role" DROP CONSTRAINT "role_alumni_id_fkey";

-- DropForeignKey
ALTER TABLE "role_raw" DROP CONSTRAINT "role_raw_role_id_fkey";

-- AlterTable
ALTER TABLE "role" ADD COLUMN     "metadata" JSONB;

-- AddForeignKey
ALTER TABLE "graduation" ADD CONSTRAINT "graduation_alumni_id_fkey" FOREIGN KEY ("alumni_id") REFERENCES "alumni"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_classification" ADD CONSTRAINT "job_classification_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_alumni_id_fkey" FOREIGN KEY ("alumni_id") REFERENCES "alumni"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_raw" ADD CONSTRAINT "role_raw_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_company" ADD CONSTRAINT "review_company_alumni_id_fkey" FOREIGN KEY ("alumni_id") REFERENCES "alumni"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_location" ADD CONSTRAINT "review_location_alumni_id_fkey" FOREIGN KEY ("alumni_id") REFERENCES "alumni"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission" ADD CONSTRAINT "permission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "alumni"("id") ON DELETE CASCADE ON UPDATE CASCADE;
