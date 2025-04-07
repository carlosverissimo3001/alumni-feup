/*
  Warnings:

  - Made the column `name_int` on table `faculty` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "faculty" ALTER COLUMN "name_int" SET NOT NULL;
