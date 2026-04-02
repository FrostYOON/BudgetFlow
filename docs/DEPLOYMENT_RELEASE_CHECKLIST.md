# Deployment Release Checklist

## KR Summary
- 이 문서는 BudgetFlow를 실제 배포할 때 확인해야 할 운영 체크리스트다.
- 로컬 개발용 설정과 운영용 설정을 분리해서 점검한다.
- API, Web, Database, Auth, CORS, Cookie, Scheduler, 모니터링 순서로 확인한다.
- 배포 직후에는 로그인, household 생성, 거래 입력, 리포트 export까지 꼭 수동 검증한다.

## 1. Environment Matrix

### API
- `NODE_ENV=production`
- `PORT`
- `API_PREFIX`
- `CORS_ORIGINS`
- `SWAGGER_PATH`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN_SECONDS`
- `JWT_REFRESH_EXPIRES_IN_SECONDS`
- `AUTH_REFRESH_COOKIE_NAME`
- `AUTH_REFRESH_COOKIE_DOMAIN`
- `AUTH_REFRESH_COOKIE_SAME_SITE`
- `AUTH_REFRESH_COOKIE_SECURE=true`
- `TRUST_PROXY=true` when deployed behind a reverse proxy or platform ingress
- `PASSWORD_HASH_SALT_ROUNDS`
- `RECURRING_EXECUTION_SCHEDULER_ENABLED`
- `RECURRING_EXECUTION_CRON`
- `RECURRING_FAILURE_NOTIFICATION_WEBHOOK_URL`
- `RECURRING_FAILURE_NOTIFICATION_THROTTLE_MINUTES`

### Web
- `BUDGETFLOW_API_URL`

## 2. Security Checks

- Use strong production secrets for both JWT secrets.
- Do not reuse local example secrets.
- Set `AUTH_REFRESH_COOKIE_SECURE=true`.
- Set `AUTH_REFRESH_COOKIE_DOMAIN` to the production parent domain when web and api are on the same top-level domain.
- Confirm `AUTH_REFRESH_COOKIE_SAME_SITE` matches the deployment topology.
- Set `CORS_ORIGINS` to exact production origins only.
- Disable any debug-only settings in production.

## 3. Database Checks

- Confirm production `DATABASE_URL` points to the intended database.
- Run `pnpm prisma:generate`.
- Run `pnpm prisma:migrate:deploy`.
- Confirm the latest migration has been applied.
- Verify the app can connect before sending traffic.

## 4. Pre-Deploy Checks

- `pnpm --filter @budgetflow/api lint`
- `pnpm --filter @budgetflow/api test -- --runInBand`
- `pnpm --filter @budgetflow/api build`
- `pnpm --filter @budgetflow/web lint`
- `pnpm --filter @budgetflow/web build`

## 5. Release Steps

1. Update production environment variables.
2. Deploy API.
3. Run Prisma deploy migration against production.
4. Deploy Web.
5. Confirm API and Web health checks.
6. Confirm scheduler is enabled only in the intended environment.

## 6. Post-Deploy Smoke Test

### Auth
- Sign up
- Sign in
- Refresh session
- Sign out

### Household
- Create household
- Update household settings
- Send invite
- Accept invite

### Budgeting
- Create transaction
- Edit transaction
- Set monthly budget
- Save category plan
- Open dashboard
- Open monthly report
- Export CSV

### Recurring
- Create recurring rule
- Open recurring ops page
- Trigger manual rerun

## 7. Scheduler Checks

- Confirm recurring execution cron is active only once per environment.
- Confirm failure webhook is configured for production.
- Confirm recurring execution history is being written.
- Confirm duplicate recurring transaction protection still works after deploy.

## 8. Monitoring and Recovery

- Verify application logs are available for both web and api.
- Verify database connection errors are visible in logs.
- Verify recurring failure notifications are delivered.
- Keep rollback instructions ready for the previous deployment artifact.

## 9. Rollback Plan

1. Roll back web deployment.
2. Roll back api deployment.
3. If a schema change is involved, assess backward compatibility before rolling back the API binary.
4. If rollback requires a database restore, stop writes first.
