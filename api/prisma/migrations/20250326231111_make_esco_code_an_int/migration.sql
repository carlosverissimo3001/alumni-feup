/*
  Warnings:

  - Changed the type of `code` on the `esco_classification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "esco_classification" DROP COLUMN "code",
ADD COLUMN     "code" INTEGER NOT NULL;
