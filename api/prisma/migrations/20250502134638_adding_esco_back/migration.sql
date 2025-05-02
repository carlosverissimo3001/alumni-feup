-- DropIndex
DROP INDEX "company_hq_location_id_key";

-- CreateTable
CREATE TABLE "esco_classification" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "level" SMALLINT NOT NULL,
    "code" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "tasks_include" TEXT NOT NULL,
    "included_occupations" TEXT NOT NULL,
    "excluded_occupations" TEXT NOT NULL,
    "notes" TEXT,
    "embedding" vector,

    CONSTRAINT "esco_classification_pkey" PRIMARY KEY ("id")
);
