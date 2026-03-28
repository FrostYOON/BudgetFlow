# BudgetFlow

Shared household budgeting SaaS for couples and families.

## Monorepo Structure

- `apps/web`: user-facing web app
- `apps/api`: backend API server
- `packages/database`: Prisma schema and database utilities
- `packages/shared`: shared types and constants
- `packages/ui`: shared UI components
- `docs`: product, DB, and API planning docs

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

- web: `apps/web/.env.local`의 `PORT` 기준
- api: `apps/api/.env.local`의 `PORT` 기준
- swagger: `http://localhost:3000/docs`

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

## Task Management

BudgetFlow tracks active engineering work with GitHub Issues and GitHub Projects.

- workflow guide: [docs/TASK_MANAGEMENT.md](/Users/yoon-yongseol/WorkSpace/BudgetFlow/docs/TASK_MANAGEMENT.md)
- project board setup: [docs/GITHUB_PROJECTS_SETUP.md](/Users/yoon-yongseol/WorkSpace/BudgetFlow/docs/GITHUB_PROJECTS_SETUP.md)
- initial backlog seed: [docs/INITIAL_BACKLOG.md](/Users/yoon-yongseol/WorkSpace/BudgetFlow/docs/INITIAL_BACKLOG.md)
- issue and PR templates: [.github](/Users/yoon-yongseol/WorkSpace/BudgetFlow/.github)
