# Database Migration Workflow

## KR Summary
- BudgetFlow는 Prisma migration을 기준으로 데이터베이스 변경 이력을 관리한다.
- Docker Compose 제어는 `docker:*`, Prisma 스키마 작업은 `prisma:*`로 분리한다.
- 로컬 개발에서는 `prisma:migrate:dev`, 운영 배포에서는 `prisma:migrate:deploy`를 사용한다.
- 현재 레포의 초기 스키마는 `init_schema` migration으로 이미 커밋되어 있다.
- 공유 또는 운영 DB에는 `migrate dev`를 사용하지 않는다.

## 1. Goal

This document defines the practical database migration workflow for BudgetFlow.
The objective is to keep local development fast while making production schema
changes predictable and auditable.

## 2. Source Of Truth

- Prisma schema: [packages/database/prisma/schema.prisma](/Users/yoon-yongseol/WorkSpace/BudgetFlow/packages/database/prisma/schema.prisma)
- Generated client: `packages/database/generated/client`
- Runtime consumer: `apps/api`

Schema changes must start in `schema.prisma`. Direct manual production schema
edits should be treated as exceptional maintenance work, not the default path.

## 3. Command Set

Run from the repo root:

```bash
pnpm prisma:validate
pnpm prisma:generate
pnpm prisma:migrate:status
pnpm prisma:migrate:dev --name <migration_name>
pnpm prisma:migrate:deploy
pnpm prisma:studio
```

What each command is for:

- `prisma:validate`: validate Prisma schema syntax and relations
- `prisma:generate`: regenerate Prisma client after schema changes
- `prisma:migrate:status`: inspect migration status against the target database
- `prisma:migrate:dev`: create and apply a development migration
- `prisma:migrate:deploy`: apply already-committed migrations in deploy environments
- `prisma:studio`: inspect data interactively

## 4. Environment Rules

Required environment variable:

```bash
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>?schema=public
```

Practical rule:

- local development DB: safe for `prisma:migrate:dev`
- shared staging/prod DB: never use `prisma:migrate:dev`
- CI/CD or deployment runtime: use `prisma:migrate:deploy`
- `prisma:validate` and `prisma:migrate:status` also require `DATABASE_URL`, because Prisma must resolve the datasource config

## 5. Local Development Flow

When changing schema locally:

1. Start the local DB if it is not already running
2. Edit `packages/database/prisma/schema.prisma`
3. Validate the schema
4. Create a named migration
5. Regenerate Prisma client
6. Run API lint/build/test
7. Commit schema + generated migration together

Recommended command sequence:

```bash
pnpm docker:start
pnpm prisma:validate
pnpm prisma:migrate:dev --name init_schema
pnpm prisma:generate
pnpm --filter @budgetflow/api lint
pnpm --filter @budgetflow/api build
pnpm --filter @budgetflow/api test -- --runInBand
```

## 6. Deployment Flow

Production-safe order:

1. Merge schema and migration files into `develop` / release branch
2. Build and test application artifacts
3. Back up the target database if required by environment policy
4. Run `pnpm prisma:migrate:deploy`
5. Start or roll the new application version

Important distinction:

- `migrate dev` creates new migration files
- `migrate deploy` only applies committed migration files

Production should never invent new migrations during deploy.

## 7. Current Migration Baseline

The repository now includes the committed initial Prisma migration:

- `20260326031342_init_schema`

This migration creates the current baseline schema, including:

- `auth_sessions` for DB-backed refresh sessions
- workspace, member, invite, category, transaction, budget, recurring, and insight tables
- indexes and foreign keys aligned to the Prisma schema

## 8. Operational Notes

- Refresh token sessions are now DB-backed, which supports multi-device auth.
- Access tokens are still stateless and expire naturally.
- If immediate access-token revocation becomes necessary, add a Redis-backed
  denylist or token `jti` strategy in a later phase.
- Migration files must be code-reviewed like application code.
- Avoid large mixed migrations. Prefer one business change per migration when practical.

## 9. Team Policy

- Never merge schema-only changes without deciding the migration name.
- Never deploy schema changes without committed migration files.
- Never run `migrate dev` against shared or production databases.
- Always run API verification after schema changes.
