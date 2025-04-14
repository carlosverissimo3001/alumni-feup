CREATE EXTENSION IF NOT EXISTS vector;

-- AlterTable
ALTER TABLE "esco_classification" ADD COLUMN     "embedding" vector;
