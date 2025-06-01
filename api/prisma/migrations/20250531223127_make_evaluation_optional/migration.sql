-- AlterTable
ALTER TABLE "job_classification" ALTER COLUMN "was_accepted_by_user" DROP NOT NULL,
ALTER COLUMN "was_accepted_by_user" DROP DEFAULT;

-- AlterTable
ALTER TABLE "role" ALTER COLUMN "was_seniority_level_accepted_by_user" DROP NOT NULL,
ALTER COLUMN "was_seniority_level_accepted_by_user" DROP DEFAULT;
