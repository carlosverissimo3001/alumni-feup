/*
  Warnings:

  - You are about to drop the column `isLeaf` on the `esco_classification` table. All the data in the column will be lost.
  - You are about to drop the `Feedback` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "esco_classification" DROP COLUMN "isLeaf",
ADD COLUMN     "is_leaf" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Feedback";

-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "type" "FEEDBACK_TYPE" NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);
