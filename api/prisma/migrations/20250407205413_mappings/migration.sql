/*
  Warnings:

  - Made the column `acronym` on table `faculty` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "faculty" ALTER COLUMN "acronym" SET NOT NULL;
