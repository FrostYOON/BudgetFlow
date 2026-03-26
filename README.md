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
pnpm db:generate
pnpm dev
```

## Database Workflow

The current schema lives in [packages/database/prisma/schema.prisma](/Users/yoon-yongseol/WorkSpace/BudgetFlow/packages/database/prisma/schema.prisma).

Common commands:

```bash
pnpm db:validate
pnpm db:generate
pnpm db:status
pnpm db:migrate:dev -- --name <migration_name>
pnpm db:migrate:deploy
pnpm db:studio
```

Operational notes:
- `db:migrate:dev` is for local development only.
- `db:migrate:deploy` is for CI/CD or production deploy steps.
- `db:validate`, `db:status`, and all migration commands require a real `DATABASE_URL`.
- The current migration workflow is documented in [docs/DB_MIGRATION_WORKFLOW.md](/Users/yoon-yongseol/WorkSpace/BudgetFlow/docs/DB_MIGRATION_WORKFLOW.md).
