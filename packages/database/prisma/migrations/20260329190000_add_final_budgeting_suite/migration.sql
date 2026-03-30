DO $$
BEGIN
  CREATE TYPE "FinancialAccountType" AS ENUM (
    'CASH',
    'CHECKING',
    'SAVINGS',
    'CREDIT_CARD',
    'E_WALLET'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "transactions"
ADD COLUMN IF NOT EXISTS "account_id" UUID;

CREATE TABLE IF NOT EXISTS "budget_templates" (
  "id" UUID NOT NULL,
  "workspace_id" UUID NOT NULL,
  "name" TEXT NOT NULL DEFAULT 'Default template',
  "total_budget_amount" DECIMAL(14,2),
  "created_by_user_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "budget_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "budget_template_categories" (
  "id" UUID NOT NULL,
  "budget_template_id" UUID NOT NULL,
  "category_id" UUID NOT NULL,
  "planned_amount" DECIMAL(14,2) NOT NULL,
  "alert_threshold_pct" INTEGER,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "budget_template_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "financial_accounts" (
  "id" UUID NOT NULL,
  "workspace_id" UUID NOT NULL,
  "created_by_user_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "type" "FinancialAccountType" NOT NULL,
  "currency" CHAR(3) NOT NULL,
  "institution_name" TEXT,
  "last_four" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_archived" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "financial_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "settlement_transfers" (
  "id" UUID NOT NULL,
  "workspace_id" UUID NOT NULL,
  "year" INTEGER NOT NULL,
  "month" INTEGER NOT NULL,
  "from_user_id" UUID NOT NULL,
  "to_user_id" UUID NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "currency" CHAR(3) NOT NULL,
  "memo" TEXT,
  "settled_at" TIMESTAMPTZ(6) NOT NULL,
  "created_by_user_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "settlement_transfers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "notification_reads" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "notification_key" TEXT NOT NULL,
  "read_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notification_reads_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "budget_templates_workspace_id_key"
ON "budget_templates"("workspace_id");

CREATE UNIQUE INDEX IF NOT EXISTS "budget_template_categories_budget_template_id_category_id_key"
ON "budget_template_categories"("budget_template_id", "category_id");

CREATE INDEX IF NOT EXISTS "budget_template_categories_category_id_idx"
ON "budget_template_categories"("category_id");

CREATE INDEX IF NOT EXISTS "financial_accounts_workspace_id_is_archived_sort_order_idx"
ON "financial_accounts"("workspace_id", "is_archived", "sort_order");

CREATE INDEX IF NOT EXISTS "transactions_workspace_id_account_id_transaction_date_idx"
ON "transactions"("workspace_id", "account_id", "transaction_date" DESC);

CREATE INDEX IF NOT EXISTS "settlement_transfers_workspace_id_year_month_settled_at_idx"
ON "settlement_transfers"("workspace_id", "year", "month", "settled_at" DESC);

CREATE INDEX IF NOT EXISTS "settlement_transfers_workspace_id_from_user_id_to_user_id_year_month_idx"
ON "settlement_transfers"("workspace_id", "from_user_id", "to_user_id", "year", "month");

CREATE UNIQUE INDEX IF NOT EXISTS "notification_reads_user_id_notification_key_key"
ON "notification_reads"("user_id", "notification_key");

CREATE INDEX IF NOT EXISTS "notification_reads_user_id_read_at_idx"
ON "notification_reads"("user_id", "read_at" DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'budget_templates_workspace_id_fkey'
  ) THEN
    ALTER TABLE "budget_templates"
    ADD CONSTRAINT "budget_templates_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'budget_templates_created_by_user_id_fkey'
  ) THEN
    ALTER TABLE "budget_templates"
    ADD CONSTRAINT "budget_templates_created_by_user_id_fkey"
    FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'budget_template_categories_budget_template_id_fkey'
  ) THEN
    ALTER TABLE "budget_template_categories"
    ADD CONSTRAINT "budget_template_categories_budget_template_id_fkey"
    FOREIGN KEY ("budget_template_id") REFERENCES "budget_templates"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'budget_template_categories_category_id_fkey'
  ) THEN
    ALTER TABLE "budget_template_categories"
    ADD CONSTRAINT "budget_template_categories_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "categories"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'financial_accounts_workspace_id_fkey'
  ) THEN
    ALTER TABLE "financial_accounts"
    ADD CONSTRAINT "financial_accounts_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'financial_accounts_created_by_user_id_fkey'
  ) THEN
    ALTER TABLE "financial_accounts"
    ADD CONSTRAINT "financial_accounts_created_by_user_id_fkey"
    FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'transactions_account_id_fkey'
  ) THEN
    ALTER TABLE "transactions"
    ADD CONSTRAINT "transactions_account_id_fkey"
    FOREIGN KEY ("account_id") REFERENCES "financial_accounts"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'settlement_transfers_workspace_id_fkey'
  ) THEN
    ALTER TABLE "settlement_transfers"
    ADD CONSTRAINT "settlement_transfers_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'settlement_transfers_from_user_id_fkey'
  ) THEN
    ALTER TABLE "settlement_transfers"
    ADD CONSTRAINT "settlement_transfers_from_user_id_fkey"
    FOREIGN KEY ("from_user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'settlement_transfers_to_user_id_fkey'
  ) THEN
    ALTER TABLE "settlement_transfers"
    ADD CONSTRAINT "settlement_transfers_to_user_id_fkey"
    FOREIGN KEY ("to_user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'settlement_transfers_created_by_user_id_fkey'
  ) THEN
    ALTER TABLE "settlement_transfers"
    ADD CONSTRAINT "settlement_transfers_created_by_user_id_fkey"
    FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notification_reads_user_id_fkey'
  ) THEN
    ALTER TABLE "notification_reads"
    ADD CONSTRAINT "notification_reads_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
