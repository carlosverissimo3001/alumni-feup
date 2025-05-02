-- AlterTable
ALTER TABLE "esco_classification" ALTER COLUMN "tasks_include" DROP NOT NULL,
ALTER COLUMN "included_occupations" DROP NOT NULL,
ALTER COLUMN "excluded_occupations" DROP NOT NULL;
