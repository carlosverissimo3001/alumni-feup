-- CreateEnum
CREATE TYPE "PIPELINE_KIND" AS ENUM ('REFRESH_EXISTING', 'INGEST_COHORT');

-- CreateEnum
CREATE TYPE "PIPELINE_TRIGGER" AS ENUM ('ADMIN_UI', 'API', 'SCHEDULE');

-- CreateEnum
CREATE TYPE "PIPELINE_RUN_STATUS" AS ENUM ('PLANNING', 'PLANNED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PIPELINE_STAGE" AS ENUM ('PLAN', 'LINKEDIN', 'COMPANY', 'CLASSIFY_ROLES', 'SENIORITY', 'LOCATION');

-- CreateEnum
CREATE TYPE "PIPELINE_STAGE_STATUS" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "PIPELINE_TASK_STATUS" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "PIPELINE_ENTITY_TYPE" AS ENUM ('ALUMNI', 'ROLE', 'COMPANY', 'LOCATION');

-- CreateTable
CREATE TABLE "pipeline_run" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "kind" "PIPELINE_KIND" NOT NULL,
    "status" "PIPELINE_RUN_STATUS" NOT NULL DEFAULT 'PLANNING',
    "triggered_by" TEXT,
    "trigger_source" "PIPELINE_TRIGGER" NOT NULL DEFAULT 'API',
    "params" JSONB,
    "applied_by" TEXT,
    "applied_at" TIMESTAMP(6),
    "error" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(6),
    "finished_at" TIMESTAMP(6),

    CONSTRAINT "pipeline_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipeline_stage" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "run_id" TEXT NOT NULL,
    "stage" "PIPELINE_STAGE" NOT NULL,
    "status" "PIPELINE_STAGE_STATUS" NOT NULL DEFAULT 'PENDING',
    "sequence" INTEGER NOT NULL,
    "total_count" INTEGER NOT NULL DEFAULT 0,
    "succeeded_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "skipped_count" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(6),
    "finished_at" TIMESTAMP(6),

    CONSTRAINT "pipeline_stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipeline_task" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "stage_id" TEXT NOT NULL,
    "entity_type" "PIPELINE_ENTITY_TYPE" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "status" "PIPELINE_TASK_STATUS" NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "skip_reason" TEXT,
    "result" JSONB,
    "error" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(6),
    "finished_at" TIMESTAMP(6),

    CONSTRAINT "pipeline_task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pipeline_run_status_idx" ON "pipeline_run"("status");

-- CreateIndex
CREATE INDEX "pipeline_run_kind_status_idx" ON "pipeline_run"("kind", "status");

-- CreateIndex
CREATE INDEX "pipeline_run_created_at_idx" ON "pipeline_run"("created_at");

-- CreateIndex
CREATE INDEX "pipeline_stage_run_id_sequence_idx" ON "pipeline_stage"("run_id", "sequence");

-- CreateIndex
CREATE INDEX "pipeline_stage_status_idx" ON "pipeline_stage"("status");

-- CreateIndex
CREATE UNIQUE INDEX "pipeline_stage_run_id_stage_key" ON "pipeline_stage"("run_id", "stage");

-- CreateIndex
CREATE INDEX "pipeline_task_stage_id_status_idx" ON "pipeline_task"("stage_id", "status");

-- CreateIndex
CREATE INDEX "pipeline_task_entity_type_entity_id_idx" ON "pipeline_task"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "pipeline_task_status_idx" ON "pipeline_task"("status");

-- CreateIndex
CREATE UNIQUE INDEX "pipeline_task_idempotency_key_key" ON "pipeline_task"("idempotency_key");

-- AddForeignKey
ALTER TABLE "pipeline_stage" ADD CONSTRAINT "pipeline_stage_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "pipeline_run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_task" ADD CONSTRAINT "pipeline_task_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "pipeline_stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
