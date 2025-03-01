/*
  Warnings:

  - You are about to drop the `Alumni` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AlumniRaw` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Faculty` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Faculty_Extraction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Graduation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Industry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JobClassification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Alumni" DROP CONSTRAINT "Alumni_current_location_id_fkey";

-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_industry_id_fkey";

-- DropForeignKey
ALTER TABLE "Faculty_Extraction" DROP CONSTRAINT "Faculty_Extraction_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Faculty_Extraction" DROP CONSTRAINT "Faculty_Extraction_faculty_id_fkey";

-- DropForeignKey
ALTER TABLE "Graduation" DROP CONSTRAINT "Graduation_alumni_id_fkey";

-- DropForeignKey
ALTER TABLE "Graduation" DROP CONSTRAINT "Graduation_course_id_fkey";

-- DropForeignKey
ALTER TABLE "JobClassification" DROP CONSTRAINT "JobClassification_role_id_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_alumni_id_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_company_id_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_location_id_fkey";

-- DropTable
DROP TABLE "Alumni";

-- DropTable
DROP TABLE "AlumniRaw";

-- DropTable
DROP TABLE "Company";

-- DropTable
DROP TABLE "Course";

-- DropTable
DROP TABLE "Faculty";

-- DropTable
DROP TABLE "Faculty_Extraction";

-- DropTable
DROP TABLE "Graduation";

-- DropTable
DROP TABLE "Industry";

-- DropTable
DROP TABLE "JobClassification";

-- DropTable
DROP TABLE "Location";

-- DropTable
DROP TABLE "Role";

-- CreateTable
CREATE TABLE "alumni" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "linkedin_url" TEXT NOT NULL,
    "personal_email" TEXT,
    "current_location_id" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMP(6),
    "updated_by" TEXT,
    "profile_picture_url" TEXT,
    "person_id" TEXT,
    "student_id" TEXT,

    CONSTRAINT "alumni_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumni_raw" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alumni_raw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "linkedin_url" TEXT,
    "industry_id" TEXT NOT NULL,

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

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_int" TEXT,
    "acronym" TEXT,

    CONSTRAINT "faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty_extraction" (
    "id" TEXT NOT NULL,
    "faculty_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "status" "GRADUATION_STATUS" NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "faculty_extraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduation" (
    "id" TEXT NOT NULL,
    "alumni_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "status" "GRADUATION_STATUS" NOT NULL,
    "conclusion_year" INTEGER,

    CONSTRAINT "graduation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_classification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" SMALLINT NOT NULL,
    "esco_code" TEXT,
    "role_id" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_classification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "country_code" TEXT NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" TEXT NOT NULL,
    "alumni_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6),
    "seniority_level" "SENIORITY_LEVEL" NOT NULL,
    "location_id" TEXT,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alumni_current_location_id_idx" ON "alumni"("current_location_id");

-- CreateIndex
CREATE INDEX "alumni_first_name_last_name_idx" ON "alumni"("first_name", "last_name");

-- CreateIndex
CREATE INDEX "alumni_linkedin_url_idx" ON "alumni"("linkedin_url");

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

-- AddForeignKey
ALTER TABLE "alumni" ADD CONSTRAINT "alumni_current_location_id_fkey" FOREIGN KEY ("current_location_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_extraction" ADD CONSTRAINT "faculty_extraction_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_extraction" ADD CONSTRAINT "faculty_extraction_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation" ADD CONSTRAINT "graduation_alumni_id_fkey" FOREIGN KEY ("alumni_id") REFERENCES "alumni"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation" ADD CONSTRAINT "graduation_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_classification" ADD CONSTRAINT "job_classification_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_alumni_id_fkey" FOREIGN KEY ("alumni_id") REFERENCES "alumni"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
