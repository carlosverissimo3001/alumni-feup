-- AlterTable
ALTER TABLE "esco_classification" ALTER COLUMN "alt_labels" DROP NOT NULL,
ALTER COLUMN "alt_labels" SET DATA TYPE TEXT;
