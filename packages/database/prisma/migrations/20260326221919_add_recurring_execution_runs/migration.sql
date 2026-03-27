-- CreateEnum
CREATE TYPE "RecurringExecutionTriggerType" AS ENUM ('MANUAL', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "RecurringExecutionRunStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "recurring_execution_runs" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "trigger_type" "RecurringExecutionTriggerType" NOT NULL,
    "target_date" DATE NOT NULL,
    "status" "RecurringExecutionRunStatus" NOT NULL,
    "initiated_by_user_id" UUID,
    "candidate_count" INTEGER,
    "created_count" INTEGER,
    "skipped_count" INTEGER,
    "error_message" TEXT,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "recurring_execution_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recurring_execution_runs_workspace_id_target_date_started_at_idx"
ON "recurring_execution_runs"("workspace_id", "target_date" DESC, "started_at" DESC);

-- CreateIndex
CREATE INDEX "recurring_execution_runs_workspace_id_status_started_at_idx"
ON "recurring_execution_runs"("workspace_id", "status", "started_at" DESC);

-- AddForeignKey
ALTER TABLE "recurring_execution_runs"
ADD CONSTRAINT "recurring_execution_runs_workspace_id_fkey"
FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_execution_runs"
ADD CONSTRAINT "recurring_execution_runs_initiated_by_user_id_fkey"
FOREIGN KEY ("initiated_by_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
