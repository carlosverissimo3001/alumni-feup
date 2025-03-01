-- CreateTable
CREATE TABLE "problematic_location" (
    "id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,

    CONSTRAINT "problematic_location_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "problematic_location" ADD CONSTRAINT "problematic_location_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
