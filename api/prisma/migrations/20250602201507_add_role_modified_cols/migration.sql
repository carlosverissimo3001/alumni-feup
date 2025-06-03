-- AlterTable
ALTER TABLE "job_classification" ADD COLUMN     "was_modified_by_user" BOOLEAN;

-- AlterTable
ALTER TABLE "role" ADD COLUMN     "was_seniority_level_modified_by_user" BOOLEAN;
