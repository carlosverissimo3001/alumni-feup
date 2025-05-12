/*
  Warnings:

  - The `upvotes` column on the `review_company` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `downvotes` column on the `review_company` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `upvotes` column on the `review_location` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `downvotes` column on the `review_location` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "review_company" DROP COLUMN "upvotes",
ADD COLUMN     "upvotes" TEXT[],
DROP COLUMN "downvotes",
ADD COLUMN     "downvotes" TEXT[];

-- AlterTable
ALTER TABLE "review_location" DROP COLUMN "upvotes",
ADD COLUMN     "upvotes" TEXT[],
DROP COLUMN "downvotes",
ADD COLUMN     "downvotes" TEXT[];
