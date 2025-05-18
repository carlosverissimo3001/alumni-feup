-- AlterTable
ALTER TABLE "job_classification" ADD COLUMN     "esco_classification_id" TEXT;

-- AddForeignKey
ALTER TABLE "job_classification" ADD CONSTRAINT "job_classification_esco_classification_id_fkey" FOREIGN KEY ("esco_classification_id") REFERENCES "esco_classification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
