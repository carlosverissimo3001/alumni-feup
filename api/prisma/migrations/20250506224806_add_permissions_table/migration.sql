-- CreateTable
CREATE TABLE "permission" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "actions" TEXT[],

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "permission" ADD CONSTRAINT "permission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "alumni"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
