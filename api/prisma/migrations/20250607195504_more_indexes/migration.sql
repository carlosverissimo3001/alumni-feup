-- CreateIndex
CREATE INDEX "role_seniority_level_company_id_idx" ON "role"("seniority_level", "company_id");

-- CreateIndex
CREATE INDEX "role_company_id_location_id_idx" ON "role"("company_id", "location_id");

-- CreateIndex
CREATE INDEX "role_is_current_idx" ON "role"("is_current");
