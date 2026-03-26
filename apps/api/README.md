# BudgetFlow API

NestJS backend for the BudgetFlow shared household budgeting product.

## Project Setup

```bash
pnpm install
```

## Run The API

```bash
cp .env.example .env.local
pnpm docker:db:start
pnpm prisma:generate
pnpm run dev
```

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

## Useful Commands

```bash
pnpm run build
pnpm run lint
pnpm prisma:generate
pnpm prisma:migrate:dev --name <migration_name>
pnpm run test
pnpm run test:e2e
```
