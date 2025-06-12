-- AlterTable
ALTER TABLE "role" ADD COLUMN     "is_hidden_in_profile" BOOLEAN DEFAULT false,
ADD COLUMN     "is_main_role" BOOLEAN DEFAULT false;
