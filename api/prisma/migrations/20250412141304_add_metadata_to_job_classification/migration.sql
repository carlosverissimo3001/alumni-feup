-- AlterTable
ALTER TABLE "job_classification" ADD COLUMN     "model_used" TEXT,
ADD COLUMN     "processing_time" DOUBLE PRECISION,
ADD COLUMN     "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;
