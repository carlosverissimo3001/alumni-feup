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

-- AddForeignKey
ALTER TABLE "review_company" ADD CONSTRAINT "review_company_alumni_id_fkey" FOREIGN KEY ("alumni_id") REFERENCES "alumni"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_company" ADD CONSTRAINT "review_company_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_location" ADD CONSTRAINT "review_location_alumni_id_fkey" FOREIGN KEY ("alumni_id") REFERENCES "alumni"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_location" ADD CONSTRAINT "review_location_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
