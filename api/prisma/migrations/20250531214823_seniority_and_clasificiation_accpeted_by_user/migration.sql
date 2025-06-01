-- AlterTable
ALTER TABLE "job_classification" ADD COLUMN     "was_accepted_by_user" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "role" ADD COLUMN     "was_seniority_level_accepted_by_user" BOOLEAN NOT NULL DEFAULT false;
