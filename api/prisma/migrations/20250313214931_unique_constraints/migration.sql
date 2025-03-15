/*
  Warnings:

  - A unique constraint covering the columns `[linkedin_url]` on the table `alumni` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[linkedin_url]` on the table `company` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "alumni_linkedin_url_key" ON "alumni"("linkedin_url");

-- CreateIndex
CREATE UNIQUE INDEX "company_linkedin_url_key" ON "company"("linkedin_url");
