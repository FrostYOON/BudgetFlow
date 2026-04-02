# Deploy BudgetFlow with Vercel + Railway

## Recommended Topology

- Web: Vercel
- API: Railway
- Database: Railway PostgreSQL

This repo is a pnpm monorepo.

- `apps/web` depends on `BUDGETFLOW_API_URL`
- `apps/api` depends on workspace packages and Prisma
- `packages/database` needs production `DATABASE_URL`

Because of that, the safest production setup is:

- Vercel for the Next.js app
- Railway for the Nest API and PostgreSQL
- a shared parent domain such as:
  - `app.example.com`
  - `api.example.com`

Using the same top-level domain keeps auth cookie behavior predictable.

## Before You Start

Prepare these production values first:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- production web origin
- production API origin
- cookie domain
- invite email sender address
- Resend API key
- Google OAuth client ID and client secret
- recurring scheduler decision

Recommended domain pattern:

- Web: `https://app.example.com`
- API: `https://api.example.com`

## 1. Create Production Database on Railway

1. Create a new Railway project.
2. Add a PostgreSQL service.
3. Copy the generated connection string.
4. Use that value for:
   - Railway API service `DATABASE_URL`
   - production migration command

## 2. Deploy API on Railway

Important:

- Keep the Railway service root at the repo root `/`
- Do not set the Railway root directory to `apps/api`
- `apps/api` depends on monorepo workspace packages outside that folder

Use these service settings in Railway:

- Root Directory: `/`
- Build Command: `pnpm install --frozen-lockfile && pnpm --filter @budgetflow/api build`
- Start Command: `pnpm --filter @budgetflow/api start:prod`

Set these required API environment variables:

- `NODE_ENV=production`
- `PORT=3000`
- `API_PREFIX=api/v1`
- `DATABASE_URL=<railway postgres url>`
- `CORS_ORIGINS=https://app.example.com`
- `JWT_ACCESS_SECRET=<strong secret>`
- `JWT_REFRESH_SECRET=<strong secret>`
- `JWT_ACCESS_EXPIRES_IN_SECONDS=3600`
- `JWT_REFRESH_EXPIRES_IN_SECONDS=2592000`
- `AUTH_REFRESH_COOKIE_NAME=budgetflow_refresh_token`
- `AUTH_REFRESH_COOKIE_DOMAIN=.example.com`
- `AUTH_REFRESH_COOKIE_SAME_SITE=lax`
- `AUTH_REFRESH_COOKIE_SECURE=true`
- `TRUST_PROXY=true`
- `PASSWORD_HASH_SALT_ROUNDS=10`
- `APP_WEB_URL=https://app.example.com`
- `RESEND_API_KEY=<resend api key>`
- `INVITE_EMAIL_FROM=BudgetFlow <invites@example.com>`
- `GOOGLE_CLIENT_ID=<google oauth client id>`
- `GOOGLE_CLIENT_SECRET=<google oauth client secret>`

Recurring execution variables:

- `RECURRING_EXECUTION_SCHEDULER_ENABLED=true`
- `RECURRING_EXECUTION_CRON=5,20,35,50 * * * *`
- `RECURRING_FAILURE_NOTIFICATION_WEBHOOK_URL=<optional>`
- `RECURRING_FAILURE_NOTIFICATION_THROTTLE_MINUTES=60`

If you do not want the scheduler active yet:

- `RECURRING_EXECUTION_SCHEDULER_ENABLED=false`

## 3. Run Production Prisma Migrations

Run this against the production database after API env is ready:

```bash
pnpm prisma:migrate:deploy
```

If you run it from a CI job or a Railway shell, make sure `DATABASE_URL` points to the production database.

## 4. Deploy Web on Vercel

Import the Git repository into Vercel.

Use these project settings:

- Framework Preset: `Next.js`
- Root Directory: `apps/web`

Set this required web environment variable:

- `BUDGETFLOW_API_URL=https://api.example.com/api/v1`
- `GOOGLE_CLIENT_ID=<google oauth client id>`

Notes:

- The app currently expects the API base URL to include `/api/v1`
- If the API URL is wrong, auth and all protected data fetching will fail

## 5. Configure Custom Domains

Recommended:

- Vercel project: `app.example.com`
- Railway API service: `api.example.com`

Then confirm:

- API CORS allows only `https://app.example.com`
- cookie domain is `.example.com`
- cookie secure is enabled
- Google OAuth redirect URI includes `https://app.example.com/auth/google/callback`

## 6. Pre-Release Validation

Run these before promoting traffic:

```bash
pnpm --filter @budgetflow/api lint
pnpm --filter @budgetflow/api test -- --runInBand
pnpm --filter @budgetflow/api build
pnpm --filter @budgetflow/web lint
pnpm --filter @budgetflow/web build
pnpm test:web:e2e
```

## 7. Post-Deploy Smoke Test

Run this in production:

1. Sign up
2. Sign in
3. Sign out
4. Create personal workspace flow
5. Add shared workspace
6. Create transaction
7. Save monthly budget
8. Open dashboard
9. Open report
10. Export CSV
11. Create recurring rule
12. Trigger recurring rerun

## 8. Current Blockers for Fully Automated Deploy from This Workspace

I have not completed an actual production deployment from this Codex session yet because:

- Vercel CLI is not installed or authenticated in this workspace
- Railway CLI is not installed or authenticated in this workspace
- production secrets and production database values are not available here

That means the repo is deploy-ready in process, but production provider setup still needs to be connected in your account.
