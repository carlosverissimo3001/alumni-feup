/*
  Warnings:

  - You are about to drop the column `esco_l1` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `esco_l2` on the `Role` table. All the data in the column will be lost.
  - Added the required column `status` to the `GraduationStatus` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `seniority_level` on the `Role` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "GRADUATION_STATUS" AS ENUM ('ACTIVE', 'GRADUATED', 'DROPOUT');

-- CreateEnum
CREATE TYPE "COURSE_STATUS" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SENIORITY_LEVEL" AS ENUM ('INTERN', 'ENTRY_LEVEL', 'ASSOCIATE', 'MID_SENIOR_LEVEL', 'DIRECTOR', 'EXECUTIVE', 'C_LEVEL');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "end_year" INTEGER,
ADD COLUMN     "status" "COURSE_STATUS" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "GraduationStatus" ADD COLUMN     "conclusion_year" INTEGER,
ADD COLUMN     "status" "GRADUATION_STATUS" NOT NULL;

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "esco_l1",
DROP COLUMN "esco_l2",
DROP COLUMN "seniority_level",
ADD COLUMN     "seniority_level" "SENIORITY_LEVEL" NOT NULL;

-- CreateTable
CREATE TABLE "JobClassification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" SMALLINT NOT NULL,
    "esco_code" TEXT,
    "role_id" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobClassification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobClassification_role_id_idx" ON "JobClassification"("role_id");

-- AddForeignKey
ALTER TABLE "JobClassification" ADD CONSTRAINT "JobClassification_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
