# Deploy BudgetFlow with Docker Compose + GitHub Actions

## Goal

This option is for a self-hosted Linux server or VPS.

- GitHub Actions triggers deployment
- the server runs Docker
- the app is started with `docker compose`

## Files Added for This Flow

- `Dockerfile.web`
- `Dockerfile.api`
- `docker-compose.prod.yml`
- `.env.production.example`
- `.github/workflows/deploy-self-hosted.yml`

## Recommended Server Shape

- Ubuntu VPS
- Docker Engine installed
- Docker Compose plugin installed
- repository cloned once onto the server
- reverse proxy handled separately with Caddy or Nginx

Recommended public routing:

- `app.example.com` -> web container port `3001`
- `api.example.com` -> api container port `3000`

## 1. Prepare the Server

Clone the repository once:

```bash
git clone <your-repo-url> budgetflow
cd budgetflow
```

Create production env:

```bash
cp .env.production.example .env.production
```

Fill in:

- `DATABASE_URL`
- `CORS_ORIGINS`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `AUTH_REFRESH_COOKIE_DOMAIN`
- `BUDGETFLOW_API_URL`

Important:

- `DATABASE_URL` should point to a managed production database
- `CORS_ORIGINS` should be the exact web origin
- if web and api use the same parent domain, set cookie domain like `.example.com`

## 2. First Manual Deploy on Server

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

## 3. Run Production Migration

Run this with the same production `DATABASE_URL`:

```bash
pnpm prisma:migrate:deploy
```

You can run it:

- from your local machine against the production DB
- from CI
- or from a shell on the server

## 4. GitHub Actions Secrets

Set these repository secrets:

- `SELF_HOSTED_DEPLOY_HOST`
- `SELF_HOSTED_DEPLOY_USER`
- `SELF_HOSTED_DEPLOY_SSH_KEY`
- `SELF_HOSTED_DEPLOY_PATH`

Example:

- `SELF_HOSTED_DEPLOY_HOST=203.0.113.10`
- `SELF_HOSTED_DEPLOY_USER=ubuntu`
- `SELF_HOSTED_DEPLOY_PATH=/home/ubuntu/budgetflow`

## 5. Deployment Flow

When `main` is updated, the workflow:

1. connects to the server over SSH
2. pulls the latest `main`
3. runs `docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build`

You can also run the workflow manually with `workflow_dispatch`.

## 6. Notes

- this workflow assumes the server already has the repo cloned
- this workflow assumes `.env.production` already exists on the server
- reverse proxy and TLS are not included in this repo yet
- `docker-compose.prod.yml` currently deploys only `web` and `api`
- production Postgres is expected to be external
