# BudgetFlow API

NestJS backend for the BudgetFlow shared household budgeting product.

## Project Setup

```bash
pnpm install
```

## Run The API

```bash
pnpm db:generate
pnpm run dev
```

## API Endpoints

- App base URL: `http://localhost:3000`
- API prefix: `http://localhost:3000/api/v1`
- Swagger docs: `http://localhost:3000/docs`
- Health check: `GET http://localhost:3000/api/v1`
- Auth sign-up: `POST http://localhost:3000/api/v1/auth/sign-up`
- Auth sign-in: `POST http://localhost:3000/api/v1/auth/sign-in`
- Auth me: `GET http://localhost:3000/api/v1/auth/me`
- Workspace create: `POST http://localhost:3000/api/v1/workspaces`
- Workspace list: `GET http://localhost:3000/api/v1/workspaces`
- Workspace detail: `GET http://localhost:3000/api/v1/workspaces/:workspaceId`
- Workspace invite create: `POST http://localhost:3000/api/v1/workspaces/:workspaceId/invites`
- Workspace invite list: `GET http://localhost:3000/api/v1/workspaces/:workspaceId/invites`
- Workspace invite accept: `POST http://localhost:3000/api/v1/workspace-invites/:token/accept`
- Workspace members: `GET http://localhost:3000/api/v1/workspaces/:workspaceId/members`

## Useful Commands

```bash
pnpm run build
pnpm run lint
pnpm db:generate
pnpm --filter @budgetflow/database prisma:migrate:dev
pnpm run test
pnpm run test:e2e
```
