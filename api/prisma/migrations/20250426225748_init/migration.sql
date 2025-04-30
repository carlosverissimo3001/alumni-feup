-- CreateEnum
CREATE TYPE "COURSE_TYPE" AS ENUM ('INTEGRATED_MASTERS', 'BACHELORS', 'MASTERS', 'DOCTORATE');

-- CreateEnum
CREATE TYPE "COURSE_STATUS" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SENIORITY_LEVEL" AS ENUM ('INTERN', 'ENTRY_LEVEL', 'ASSOCIATE', 'MID_SENIOR_LEVEL', 'DIRECTOR', 'EXECUTIVE', 'C_LEVEL');

-- CreateEnum
CREATE TYPE "COMPANY_SIZE" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I');

-- CreateEnum
CREATE TYPE "Source" AS ENUM ('FORM_SUBMISSION', 'ADMIN_IMPORT', 'HONORARY_MEMBER');

-- CreateTable
CREATE TABLE "alumni" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "linkedin_url" TEXT,
    "personal_email" TEXT,
    "current_location_id" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "profile_picture_url" TEXT,
    "person_id" TEXT,
    "source" "Source",
    "has_sigarra_match" BOOLEAN NOT NULL,
    "is_in_group" BOOLEAN NOT NULL,
    "full_name" TEXT,
    "was_reviewed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "alumni_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "linkedin_url" TEXT,
    "industry_id" TEXT NOT NULL,
    "logo" TEXT,
    "founded" INTEGER,
    "company_size" "COMPANY_SIZE",
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "website" TEXT,
    "hq_location_id" TEXT,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acronym" TEXT NOT NULL,
    "end_year" INTEGER,
    "status" "COURSE_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "faculty_id" TEXT NOT NULL,
    "name_int" TEXT,
    "course_type" "COURSE_TYPE" NOT NULL,
    "start_year" INTEGER NOT NULL,

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_int" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,

    CONSTRAINT "faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduation" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "alumni_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "conclusion_year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "graduation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,

    CONSTRAINT "industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_classification" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "level" SMALLINT NOT NULL,
    "esco_code" TEXT,
    "role_id" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "model_used" TEXT,
    "processing_time" DOUBLE PRECISION,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ranking" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "job_classification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "city" TEXT,
    "country" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "country_code" TEXT,
    "is_country_only" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problematic_location" (
    "id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "isExpected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "problematic_location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "alumni_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6),
    "seniority_level" "SENIORITY_LEVEL" NOT NULL,
    "location_id" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "is_promotion" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_raw" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "description" TEXT,
    "role_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_raw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_company" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "alumni_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "rating" SMALLINT NOT NULL,
    "description" TEXT,
    "upvotes" SMALLINT NOT NULL DEFAULT 0,
    "downvotes" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_location" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "alumni_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "rating" SMALLINT NOT NULL,
    "description" TEXT,
    "upvotes" SMALLINT NOT NULL DEFAULT 0,
    "downvotes" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "alumni_linkedin_url_key" ON "alumni"("linkedin_url");

-- CreateIndex
CREATE INDEX "alumni_current_location_id_idx" ON "alumni"("current_location_id");

-- CreateIndex
CREATE INDEX "alumni_first_name_last_name_idx" ON "alumni"("first_name", "last_name");

-- CreateIndex
CREATE INDEX "alumni_linkedin_url_idx" ON "alumni"("linkedin_url");

-- CreateIndex
CREATE UNIQUE INDEX "company_linkedin_url_key" ON "company"("linkedin_url");

-- CreateIndex
CREATE UNIQUE INDEX "company_hq_location_id_key" ON "company"("hq_location_id");

-- CreateIndex
CREATE INDEX "company_industry_id_idx" ON "company"("industry_id");

-- CreateIndex
CREATE INDEX "graduation_alumni_id_idx" ON "graduation"("alumni_id");

-- CreateIndex
CREATE INDEX "graduation_course_id_idx" ON "graduation"("course_id");

-- CreateIndex
CREATE INDEX "industry_name_idx" ON "industry"("name");

-- CreateIndex
CREATE INDEX "job_classification_role_id_idx" ON "job_classification"("role_id");

-- CreateIndex
CREATE INDEX "job_classification_title_idx" ON "job_classification"("title");

-- CreateIndex
CREATE INDEX "location_city_country_idx" ON "location"("city", "country");

-- CreateIndex
CREATE INDEX "location_country_code_idx" ON "location"("country_code");

-- CreateIndex
CREATE INDEX "location_latitude_longitude_idx" ON "location"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "role_alumni_id_idx" ON "role"("alumni_id");

-- CreateIndex
CREATE INDEX "role_company_id_idx" ON "role"("company_id");

-- CreateIndex
CREATE INDEX "role_location_id_idx" ON "role"("location_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_raw_role_id_key" ON "role_raw"("role_id");

-- CreateIndex
CREATE INDEX "role_raw_role_id_idx" ON "role_raw"("role_id");

-- AddForeignKey
ALTER TABLE "alumni" ADD CONSTRAINT "alumni_current_location_id_fkey" FOREIGN KEY ("current_location_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_hq_location_id_fkey" FOREIGN KEY ("hq_location_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation" ADD CONSTRAINT "graduation_alumni_id_fkey" FOREIGN KEY ("alumni_id") REFERENCES "alumni"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation" ADD CONSTRAINT "graduation_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_classification" ADD CONSTRAINT "job_classification_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problematic_location" ADD CONSTRAINT "problematic_location_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_alumni_id_fkey" FOREIGN KEY ("alumni_id") REFERENCES "alumni"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_raw" ADD CONSTRAINT "role_raw_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_company" ADD CONSTRAINT "review_company_alumni_id_fkey" FOREIGN KEY ("alumni_id") REFERENCES "alumni"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_company" ADD CONSTRAINT "review_company_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_location" ADD CONSTRAINT "review_location_alumni_id_fkey" FOREIGN KEY ("alumni_id") REFERENCES "alumni"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_location" ADD CONSTRAINT "review_location_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
