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

## Useful Commands

```bash
pnpm run build
pnpm run lint
pnpm db:generate
pnpm --filter @budgetflow/database prisma:migrate:dev
pnpm run test
pnpm run test:e2e
```
