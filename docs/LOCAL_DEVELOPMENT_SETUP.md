# Local Development Setup

## KR Summary
- 로컬 Postgres는 `docker compose`로 실행한다.
- 루트 `.env`는 Docker Compose용 변수 파일이다.
- `apps/api/.env.local`은 API 런타임 변수 파일이다.
- 기본 로컬 DB는 `postgresql://postgres:postgres@localhost:5432/budgetflow?schema=public`를 사용한다.
- Docker Compose 제어는 `docker:*`, Prisma 작업은 `prisma:*` 스크립트로 분리한다.

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
pnpm docker:start
```

Stop it:

```bash
pnpm docker:stop
```

Watch logs:

```bash
pnpm docker:logs
```

## 3. Default Local Database

```bash
postgresql://postgres:postgres@localhost:5432/budgetflow?schema=public
```

This is the default value included in both `apps/api/.env.example` and `packages/database/.env.example`.

## 4. Local Migration Flow

After the DB container is up:

```bash
pnpm prisma:validate
pnpm prisma:migrate:dev --name init_schema
pnpm prisma:generate
pnpm --filter @budgetflow/api build
```

## 5. Notes

- `.env` is for Docker Compose variables.
- `packages/database/.env` is for Prisma CLI commands.
- `apps/api/.env.local` is for Nest runtime config.
- `apps/web/.env.local` controls the Next.js port with `PORT`.
- `apps/api/.env.local` controls the Nest port with `PORT`.
- Do not commit real local secrets.
- For shared or production databases, use deploy-time migrations instead of `migrate:dev`.
