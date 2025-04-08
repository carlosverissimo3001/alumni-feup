/*
  Warnings:

  - Added the required column `title` to the `role_raw` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "role_raw" ADD COLUMN     "title" TEXT NOT NULL;
