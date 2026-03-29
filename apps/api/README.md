# BudgetFlow API

NestJS backend for the BudgetFlow personal-first budgeting product with shared workspace support.

## Project Setup

```bash
pnpm install
```

## Run The API

```bash
cp .env.example .env.local
pnpm docker:start
pnpm prisma:generate
pnpm run dev
```

Recurring transaction automation runs on a scheduler and evaluates each workspace in its own timezone. The default cron checks every 15 minutes in UTC and only executes workspaces whose local time is in the first 15 minutes after midnight.

## API Endpoints

- App base URL: `http://localhost:3000`
- API prefix: `http://localhost:3000/api/v1`
- Swagger docs: `http://localhost:3000/docs`
- Health check: `GET http://localhost:3000/api/v1`
- Auth sign-up: `POST http://localhost:3000/api/v1/auth/sign-up`
- Auth sign-in: `POST http://localhost:3000/api/v1/auth/sign-in`
- Auth refresh: `POST http://localhost:3000/api/v1/auth/refresh`
- Auth me: `GET http://localhost:3000/api/v1/auth/me`
- Auth sign-out: `POST http://localhost:3000/api/v1/auth/sign-out`
- Workspace create: `POST http://localhost:3000/api/v1/workspaces`
- Workspace list: `GET http://localhost:3000/api/v1/workspaces`
- Workspace detail: `GET http://localhost:3000/api/v1/workspaces/:workspaceId`
- Workspace invite create: `POST http://localhost:3000/api/v1/workspaces/:workspaceId/invites`
- Workspace invite list: `GET http://localhost:3000/api/v1/workspaces/:workspaceId/invites`
- Workspace invite accept: `POST http://localhost:3000/api/v1/workspace-invites/:token/accept`
- Workspace members: `GET http://localhost:3000/api/v1/workspaces/:workspaceId/members`
- Categories list: `GET http://localhost:3000/api/v1/workspaces/:workspaceId/categories`
- Category create: `POST http://localhost:3000/api/v1/workspaces/:workspaceId/categories`
- Category update: `PATCH http://localhost:3000/api/v1/workspaces/:workspaceId/categories/:categoryId`
- Category archive: `DELETE http://localhost:3000/api/v1/workspaces/:workspaceId/categories/:categoryId`
- Transaction create: `POST http://localhost:3000/api/v1/workspaces/:workspaceId/transactions`
- Transaction list: `GET http://localhost:3000/api/v1/workspaces/:workspaceId/transactions`
- Transaction detail: `GET http://localhost:3000/api/v1/workspaces/:workspaceId/transactions/:transactionId`
- Transaction delete: `DELETE http://localhost:3000/api/v1/workspaces/:workspaceId/transactions/:transactionId`
- Monthly budget upsert: `PUT http://localhost:3000/api/v1/workspaces/:workspaceId/budgets/:year/:month`
- Monthly budget detail: `GET http://localhost:3000/api/v1/workspaces/:workspaceId/budgets/:year/:month`
- Category budget replace: `PUT http://localhost:3000/api/v1/workspaces/:workspaceId/budgets/:year/:month/categories`
- Category budget delete: `DELETE http://localhost:3000/api/v1/workspaces/:workspaceId/budgets/:year/:month/categories/:categoryId`
- Monthly insights: `GET http://localhost:3000/api/v1/workspaces/:workspaceId/insights/monthly?year=2026&month=3`
- Dashboard summary: `GET http://localhost:3000/api/v1/workspaces/:workspaceId/dashboard?year=2026&month=3`
- Recurring transaction create: `POST http://localhost:3000/api/v1/workspaces/:workspaceId/recurring-transactions`
- Recurring transaction list: `GET http://localhost:3000/api/v1/workspaces/:workspaceId/recurring-transactions`
- Recurring ops summary: `GET http://localhost:3000/api/v1/workspaces/:workspaceId/recurring-transactions/ops`
- Recurring transaction execute: `POST http://localhost:3000/api/v1/workspaces/:workspaceId/recurring-transactions/execute`
- Recurring execution runs: `GET http://localhost:3000/api/v1/workspaces/:workspaceId/recurring-transactions/execution-runs`
- Recurring execution rerun: `POST http://localhost:3000/api/v1/workspaces/:workspaceId/recurring-transactions/execution-runs/rerun`
- Recurring transaction update: `PATCH http://localhost:3000/api/v1/workspaces/:workspaceId/recurring-transactions/:recurringTransactionId`
- Recurring transaction deactivate: `DELETE http://localhost:3000/api/v1/workspaces/:workspaceId/recurring-transactions/:recurringTransactionId`
- Monthly report: `GET http://localhost:3000/api/v1/workspaces/:workspaceId/reports/monthly?year=2026&month=3`

## Useful Commands

```bash
pnpm run build
pnpm run lint
pnpm prisma:generate
pnpm prisma:migrate:dev --name <migration_name>
pnpm run test
pnpm run test:e2e
```
