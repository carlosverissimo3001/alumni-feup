-- CreateIndex
CREATE INDEX "alumni_full_name_idx" ON "alumni"("full_name");

-- CreateIndex
CREATE INDEX "company_hq_location_id_idx" ON "company"("hq_location_id");

-- CreateIndex
CREATE INDEX "company_levels_fyi_url_idx" ON "company"("levels_fyi_url");

-- CreateIndex
CREATE INDEX "company_company_size_idx" ON "company"("company_size");

-- CreateIndex
CREATE INDEX "company_company_type_idx" ON "company"("company_type");

-- CreateIndex
CREATE INDEX "esco_classification_code_idx" ON "esco_classification"("code");

-- CreateIndex
CREATE INDEX "permission_user_id_resource_idx" ON "permission"("user_id", "resource");

-- CreateIndex
CREATE INDEX "role_start_date_idx" ON "role"("start_date");

-- CreateIndex
CREATE INDEX "role_end_date_idx" ON "role"("end_date");
