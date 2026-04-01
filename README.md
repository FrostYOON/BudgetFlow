# BudgetFlow

Shared household budgeting SaaS for couples and families.

## Monorepo Structure

- `apps/web`: user-facing web app
- `apps/api`: backend API server
- `packages/database`: Prisma schema and database utilities
- `packages/shared`: shared types and constants
- `packages/ui`: shared UI components
- `docs`: product, DB, and API planning docs

## Current Product Status

BudgetFlow is no longer just an MVP scaffold. The repository currently includes:

- auth and account session management
- personal-first onboarding plus additional shared workspace creation
- dashboard, transactions, budgets, settlements, recurring, reports, notifications, and settings flows
- Prisma migrations, API e2e coverage, web e2e coverage, and CI validation

The highest-priority current work is mobile-first UX refinement and delivery-plan sync rather than adding broad new modules.

- delivery execution plan: [docs/DELIVERY_EXECUTION_PLAN.md](/Users/yoon-yongseol/WorkSpace/BudgetFlow/docs/DELIVERY_EXECUTION_PLAN.md)
- product direction: [docs/PRODUCT_PLAN.md](/Users/yoon-yongseol/WorkSpace/BudgetFlow/docs/PRODUCT_PLAN.md)
- user onboarding guide: [docs/USER_ONBOARDING_GUIDE.md](/Users/yoon-yongseol/WorkSpace/BudgetFlow/docs/USER_ONBOARDING_GUIDE.md)
- latest verification report: [docs/FEATURE_VERIFICATION_2026_03_31.md](/Users/yoon-yongseol/WorkSpace/BudgetFlow/docs/FEATURE_VERIFICATION_2026_03_31.md)

## Quick Start

```bash
pnpm install
cp .env.example .env
cp packages/database/.env.example packages/database/.env
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local
pnpm docker:start
pnpm prisma:generate
pnpm dev
```

Default local ports:

- web: `http://localhost:3001`
- api: `apps/api/.env.local`의 `PORT` 기준
- swagger: `http://localhost:3000/docs`

`pnpm dev`, `pnpm dev:api`, `pnpm dev:web` run a startup config check first. If a required local env file is missing, the command exits with the exact `cp ...` command to fix it.

## Local Database

BudgetFlow uses Docker Compose for the default local PostgreSQL setup.

Common local DB commands:

```bash
pnpm docker:start
pnpm docker:logs
pnpm docker:stop
pnpm docker:status
```

The default local connection string is:

```bash
postgresql://postgres:postgres@localhost:5432/budgetflow?schema=public
```

Prisma CLI reads `DATABASE_URL` from `packages/database/.env`.

## Database Workflow

The current schema lives in [packages/database/prisma/schema.prisma](/Users/yoon-yongseol/WorkSpace/BudgetFlow/packages/database/prisma/schema.prisma).

Common commands:

```bash
pnpm prisma:validate
pnpm prisma:generate
pnpm prisma:migrate:status
pnpm prisma:migrate:dev --name <migration_name>
pnpm prisma:migrate:deploy
pnpm prisma:studio
```

Operational notes:
- `docker:*` scripts control the local Docker Compose stack.
- `prisma:*` scripts control only Prisma schema, client, and migration work.
- `prisma:migrate:dev` is for local development only.
- `prisma:migrate:deploy` is for CI/CD or production deploy steps.
- `prisma:validate`, `prisma:migrate:status`, and all migration commands require a real `DATABASE_URL`.
- The current migration workflow is documented in [docs/DB_MIGRATION_WORKFLOW.md](/Users/yoon-yongseol/WorkSpace/BudgetFlow/docs/DB_MIGRATION_WORKFLOW.md).

## Test Commands

```bash
pnpm test:api
pnpm test:web:e2e
```

Notes:
- `pnpm test:web:e2e` starts the API and web app automatically through Playwright.
- Local Postgres must already be running before web e2e starts.
- In CI, Playwright browser installation and web e2e are handled by [validate.yml](/Users/yoon-yongseol/WorkSpace/BudgetFlow/.github/workflows/validate.yml).

## Task Management

BudgetFlow tracks active engineering work with GitHub Issues and GitHub Projects.

- workflow guide: [docs/TASK_MANAGEMENT.md](/Users/yoon-yongseol/WorkSpace/BudgetFlow/docs/TASK_MANAGEMENT.md)
- project board setup: [docs/GITHUB_PROJECTS_SETUP.md](/Users/yoon-yongseol/WorkSpace/BudgetFlow/docs/GITHUB_PROJECTS_SETUP.md)
- initial backlog seed: [docs/INITIAL_BACKLOG.md](/Users/yoon-yongseol/WorkSpace/BudgetFlow/docs/INITIAL_BACKLOG.md)
- current execution plan: [docs/DELIVERY_EXECUTION_PLAN.md](/Users/yoon-yongseol/WorkSpace/BudgetFlow/docs/DELIVERY_EXECUTION_PLAN.md)
- issue and PR templates: [.github](/Users/yoon-yongseol/WorkSpace/BudgetFlow/.github)
- deployment checklist: [docs/DEPLOYMENT_RELEASE_CHECKLIST.md](/Users/yoon-yongseol/WorkSpace/BudgetFlow/docs/DEPLOYMENT_RELEASE_CHECKLIST.md)
