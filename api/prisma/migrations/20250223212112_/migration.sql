/*
  Warnings:

  - You are about to drop the column `sector` on the `Industry` table. All the data in the column will be lost.
  - Added the required column `industry_id` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "industry_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Industry" DROP COLUMN "sector";

-- CreateIndex
CREATE INDEX "Alumni_first_name_last_name_idx" ON "Alumni"("first_name", "last_name");

-- CreateIndex
CREATE INDEX "Alumni_linkedin_url_idx" ON "Alumni"("linkedin_url");

-- CreateIndex
CREATE INDEX "Company_industry_id_idx" ON "Company"("industry_id");

-- CreateIndex
CREATE INDEX "Industry_name_idx" ON "Industry"("name");

-- CreateIndex
CREATE INDEX "JobClassification_title_idx" ON "JobClassification"("title");

-- CreateIndex
CREATE INDEX "Role_alumni_id_idx" ON "Role"("alumni_id");

-- CreateIndex
CREATE INDEX "Role_company_id_idx" ON "Role"("company_id");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "Industry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
