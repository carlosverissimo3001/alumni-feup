/*
  Warnings:

  - A unique constraint covering the columns `[role_id]` on the table `role_raw` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "role_raw_role_id_key" ON "role_raw"("role_id");

-- AddForeignKey
ALTER TABLE "role_raw" ADD CONSTRAINT "role_raw_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
