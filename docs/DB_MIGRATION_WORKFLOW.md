# Database Migration Workflow

## KR Summary
- BudgetFlow는 Prisma migration을 기준으로 데이터베이스 변경 이력을 관리한다.
- 로컬 개발에서는 `migrate dev`, 운영 배포에서는 `migrate deploy`를 사용한다.
- refresh auth와 `auth_sessions` 같은 변경도 반드시 migration 파일로 남긴다.
- 현재 레포에는 `DATABASE_URL`이 없어서 migration 생성은 아직 실행하지 않았다.
- 실제 DB 연결 후에는 가장 먼저 `auth_sessions` 추가 migration을 생성해야 한다.

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
pnpm db:validate
pnpm db:generate
pnpm db:status
pnpm db:migrate:dev --name <migration_name>
pnpm db:migrate:deploy
pnpm db:studio
```

What each command is for:

- `db:validate`: validate Prisma schema syntax and relations
- `db:generate`: regenerate Prisma client after schema changes
- `db:status`: inspect migration status against the target database
- `db:migrate:dev`: create and apply a development migration
- `db:migrate:deploy`: apply already-committed migrations in deploy environments
- `db:studio`: inspect data interactively

## 4. Environment Rules

Required environment variable:

```bash
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>?schema=public
```

Practical rule:

- local development DB: safe for `db:migrate:dev`
- shared staging/prod DB: never use `db:migrate:dev`
- CI/CD or deployment runtime: use `db:migrate:deploy`
- `db:validate` and `db:status` also require `DATABASE_URL`, because Prisma must resolve the datasource config

## 5. Local Development Flow

When changing schema locally:

1. Edit `packages/database/prisma/schema.prisma`
2. Validate the schema
3. Create a named migration
4. Regenerate Prisma client
5. Run API lint/build/test
6. Commit schema + generated migration together

Recommended command sequence:

```bash
pnpm db:validate
pnpm db:migrate:dev --name init_schema
pnpm db:generate
pnpm --filter @budgetflow/api lint
pnpm --filter @budgetflow/api build
pnpm --filter @budgetflow/api test -- --runInBand
```

## 6. Deployment Flow

Production-safe order:

1. Merge schema and migration files into `develop` / release branch
2. Build and test application artifacts
3. Back up the target database if required by environment policy
4. Run `pnpm db:migrate:deploy`
5. Start or roll the new application version

Important distinction:

- `migrate dev` creates new migration files
- `migrate deploy` only applies committed migration files

Production should never invent new migrations during deploy.

## 7. Current Pending Migration

The current codebase now expects an `auth_sessions` table and no longer relies
on `users.refresh_token_hash`.

Once a real `DATABASE_URL` is available, the first migration should be created
with a name close to:

```bash
pnpm db:migrate:dev --name init_schema
```

Expected schema impact:

- create the full initial schema from Prisma
- include `auth_sessions` from the current auth design
- align all indexes and foreign keys with the Prisma schema

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
