/*
  Warnings:

  - You are about to drop the `Invite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Trend` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Invite";

-- DropTable
DROP TABLE "Trend";

-- CreateTable
CREATE TABLE "trend" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "entity_name" TEXT NOT NULL,
    "type" "TREND_TYPE" NOT NULL,
    "unit" "TREND_UNIT" NOT NULL DEFAULT 'MONTH',
    "init_label" TEXT NOT NULL,
    "end_label" TEXT NOT NULL,
    "trend" INTEGER[],
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invite" (
    "email" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invite_pkey" PRIMARY KEY ("email")
);
