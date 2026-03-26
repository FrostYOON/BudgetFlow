# Local Development Setup

## KR Summary
- 로컬 Postgres는 `docker compose`로 실행한다.
- 루트 `.env`는 Docker Compose용 변수 파일이다.
- `apps/api/.env.local`은 API 런타임 변수 파일이다.
- 기본 로컬 DB는 `postgresql://postgres:postgres@localhost:5432/budgetflow?schema=public`를 사용한다.
- DB를 올린 뒤 `pnpm db:migrate:dev --name <name>` 순서로 migration을 만든다.

## 1. Required Files

Create these files for local development:

- root `.env`
- `packages/database/.env`
- `apps/api/.env.local`

Reference templates:

- [/.env.example](/Users/yoon-yongseol/WorkSpace/BudgetFlow/.env.example)
- [packages/database/.env.example](/Users/yoon-yongseol/WorkSpace/BudgetFlow/packages/database/.env.example)
- [apps/api/.env.example](/Users/yoon-yongseol/WorkSpace/BudgetFlow/apps/api/.env.example)

## 2. Start Local Postgres

```bash
pnpm db:up
```

Stop it:

```bash
pnpm db:down
```

Watch logs:

```bash
pnpm db:logs
```

## 3. Default Local Database

```bash
postgresql://postgres:postgres@localhost:5432/budgetflow?schema=public
```

This is the default value included in both `apps/api/.env.example` and `packages/database/.env.example`.

## 4. Local Migration Flow

After the DB container is up:

```bash
pnpm db:validate
pnpm db:migrate:dev --name init_schema
pnpm db:generate
pnpm --filter @budgetflow/api build
```

## 5. Notes

- `.env` is for Docker Compose variables.
- `packages/database/.env` is for Prisma CLI commands.
- `apps/api/.env.local` is for Nest runtime config.
- Do not commit real local secrets.
- For shared or production databases, use deploy-time migrations instead of `migrate:dev`.
