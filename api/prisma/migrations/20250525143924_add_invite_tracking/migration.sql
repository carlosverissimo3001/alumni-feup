/*
  Warnings:

  - You are about to drop the column `used` on the `invite` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "invite" DROP COLUMN "used",
ADD COLUMN     "usedCount" INTEGER NOT NULL DEFAULT 0;
