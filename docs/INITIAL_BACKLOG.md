# Initial Backlog

## KR Summary
- 이 문서는 GitHub Issues로 바로 옮길 수 있는 BudgetFlow 초기 백로그 초안이다.
- 큰 기능은 Epic으로, 실제 구현 단위는 Task로 나눴다.
- 각 항목에는 권장 `area`, `priority`, `status`, `branch prefix`를 함께 적어두었다.
- 운영 기준은 [docs/TASK_MANAGEMENT.md](/Users/yoon-yongseol/WorkSpace/BudgetFlow/docs/TASK_MANAGEMENT.md) 와 [docs/GITHUB_PROJECTS_SETUP.md](/Users/yoon-yongseol/WorkSpace/BudgetFlow/docs/GITHUB_PROJECTS_SETUP.md) 를 따른다.

## 1. Recommended Initial Project Scope

The recommended initial GitHub Project scope for BudgetFlow should focus on:

- API hardening
- web app MVP
- onboarding flow
- ops and observability
- QA and release readiness

## 2. Epic Backlog

### Epic: Web MVP Shell

- `area:web`
- `priority:P0`
- `status:Todo`

Goal:
- Build the first usable web shell for authentication, workspace selection, dashboard, and primary navigation.

Suggested sub-issues:
- Add authenticated app layout
- Add sign-in and sign-up screens
- Add workspace switcher and onboarding route
- Add dashboard summary screen

### Epic: Transaction Management UX

- `area:web`
- `priority:P0`
- `status:Todo`

Goal:
- Enable users to create, browse, and manage household transactions from the web UI.

Suggested sub-issues:
- Add transaction list page
- Add transaction create form
- Add transaction detail sheet
- Add transaction update API and UI

### Epic: Budget Management UX

- `area:web`
- `priority:P1`
- `status:Todo`

Goal:
- Expose monthly budget and category budget management through the web app.

Suggested sub-issues:
- Add monthly budget summary card
- Add budget setup form
- Add category budget allocation editor

### Epic: Recurring Operations Console

- `area:api`
- `priority:P1`
- `status:Todo`

Goal:
- Improve visibility and control for recurring transaction automation.

Suggested sub-issues:
- Add recurring ops admin UI
- Add recurring execution failure notifications
- Add recurring execution health checks

### Epic: Onboarding and Starter Data

- `area:product`
- `priority:P1`
- `status:Todo`

Goal:
- Reduce time-to-value for first-time households.

Suggested sub-issues:
- Add starter category seed flow
- Add default budget onboarding flow
- Add invite-first workspace onboarding

### Epic: QA and Release Readiness

- `area:infra`
- `priority:P1`
- `status:Todo`

Goal:
- Raise confidence before external testing or launch.

Suggested sub-issues:
- Add API e2e coverage for auth
- Add API e2e coverage for workspace onboarding
- Add CI validation workflow
- Add environment matrix and deployment checklist

## 3. Recommended Task Issues

The items below are ready to be created as GitHub Issues immediately.

---

### Task: Add recurring ops admin UI

- `area:web`
- `priority:P0`
- `status:Todo`
- `branch prefix: feature/recurring-ops-admin-ui`

Summary:
- Build an authenticated workspace page that consumes the recurring ops summary API and displays scheduler state, recent failures, and execution statistics.

Acceptance Criteria:
- authenticated member can open the page
- page calls `GET /api/v1/workspaces/:workspaceId/recurring-transactions/ops`
- page shows scheduler status, next target date, active recurring count, and recent failures
- loading, empty, and error states are handled

References:
- [apps/api/src/modules/recurring-transactions/services/recurring-transaction-ops.service.ts](/Users/yoon-yongseol/WorkSpace/BudgetFlow/apps/api/src/modules/recurring-transactions/services/recurring-transaction-ops.service.ts)

---

### Task: Add transaction update API

- `area:api`
- `priority:P0`
- `status:Todo`
- `branch prefix: feature/transaction-update-api`

Summary:
- Add update support for existing transactions, including category, amount, notes, date, and payer changes.

Acceptance Criteria:
- `PATCH /api/v1/workspaces/:workspaceId/transactions/:transactionId` exists
- only workspace members can update
- category and payer validation rules match create flow
- soft-deleted transactions cannot be updated
- tests cover success and rejection paths

References:
- [apps/api/src/modules/transactions/services/transactions.service.ts](/Users/yoon-yongseol/WorkSpace/BudgetFlow/apps/api/src/modules/transactions/services/transactions.service.ts)

---

### Task: Add starter category seed flow

- `area:api`
- `priority:P1`
- `status:Todo`
- `branch prefix: feature/starter-category-seed`

Summary:
- Add a standard starter category set for new workspaces to reduce setup time.

Acceptance Criteria:
- default categories can be created during or right after workspace creation
- categories are appropriate for couples and families
- seeding is idempotent for the same workspace
- tests cover duplicate protection

References:
- [apps/api/src/modules/categories/services/categories.service.ts](/Users/yoon-yongseol/WorkSpace/BudgetFlow/apps/api/src/modules/categories/services/categories.service.ts)

---

### Task: Add API e2e coverage for auth and workspace onboarding

- `area:infra`
- `priority:P1`
- `status:Todo`
- `branch prefix: test/api-e2e-auth-workspace`

Summary:
- Add end-to-end coverage for sign-up, sign-in, workspace creation, invite acceptance, and auth refresh flows.

Acceptance Criteria:
- e2e test suite runs in CI-ready form
- auth cookie and token flows are covered
- workspace invite acceptance path is covered
- failure scenarios are covered for invalid auth and invalid invite token

References:
- [apps/api/test/app.e2e-spec.ts](/Users/yoon-yongseol/WorkSpace/BudgetFlow/apps/api/test/app.e2e-spec.ts)

---

### Task: Add authenticated web app shell

- `area:web`
- `priority:P0`
- `status:Todo`
- `branch prefix: feature/web-app-shell`

Summary:
- Build the base authenticated layout for the product with navigation, workspace context, and protected routing.

Acceptance Criteria:
- unauthenticated users are redirected to auth pages
- authenticated users land in the app shell
- shell includes primary navigation for dashboard, transactions, budgets, and recurring
- workspace context is available in layout state

References:
- [apps/web/app](/Users/yoon-yongseol/WorkSpace/BudgetFlow/apps/web/app)

---

### Task: Add sign-in and sign-up screens

- `area:web`
- `priority:P0`
- `status:Todo`
- `branch prefix: feature/web-auth-screens`

Summary:
- Build first-pass auth screens connected to the existing Nest auth endpoints.

Acceptance Criteria:
- sign-in and sign-up forms submit to API
- validation and error messages are surfaced
- auth success stores the access token correctly for subsequent API calls
- refresh cookie flow is compatible with the web client

References:
- [apps/api/src/modules/auth/auth.controller.ts](/Users/yoon-yongseol/WorkSpace/BudgetFlow/apps/api/src/modules/auth/auth.controller.ts)

---

### Task: Add dashboard summary screen

- `area:web`
- `priority:P0`
- `status:Todo`
- `branch prefix: feature/dashboard-summary-screen`

Summary:
- Build the first dashboard page on top of the dashboard and insights APIs.

Acceptance Criteria:
- screen renders budget summary, recent transactions, top categories, and insights
- year/month selection works
- loading and empty states are handled
- design supports mobile and desktop layouts

References:
- [apps/api/src/modules/dashboard/services/dashboard.service.ts](/Users/yoon-yongseol/WorkSpace/BudgetFlow/apps/api/src/modules/dashboard/services/dashboard.service.ts)
- [apps/api/src/modules/insights/services/insights.service.ts](/Users/yoon-yongseol/WorkSpace/BudgetFlow/apps/api/src/modules/insights/services/insights.service.ts)

---

### Task: Add recurring execution failure notifications

- `area:api`
- `priority:P1`
- `status:Todo`
- `branch prefix: feature/recurring-failure-notifications`

Summary:
- Add a notification mechanism for failed recurring execution runs so operators can react quickly.

Acceptance Criteria:
- failed execution runs trigger a notification hook
- notification payload contains workspace, target date, and error summary
- repeated failures can be deduplicated or throttled
- implementation is disabled cleanly in local development when not configured

References:
- [apps/api/src/modules/recurring-transactions/services/recurring-transactions-scheduler.service.ts](/Users/yoon-yongseol/WorkSpace/BudgetFlow/apps/api/src/modules/recurring-transactions/services/recurring-transactions-scheduler.service.ts)
- [apps/api/src/modules/recurring-transactions/services/recurring-transaction-execution-runs.service.ts](/Users/yoon-yongseol/WorkSpace/BudgetFlow/apps/api/src/modules/recurring-transactions/services/recurring-transaction-execution-runs.service.ts)

## 4. Suggested Creation Order

Create issues in this order:

1. Add authenticated web app shell
2. Add sign-in and sign-up screens
3. Add dashboard summary screen
4. Add transaction update API
5. Add starter category seed flow
6. Add recurring ops admin UI
7. Add API e2e coverage for auth and workspace onboarding
8. Add recurring execution failure notifications

## 5. How To Use This File

Use this file as a seed list only.

Recommended workflow:

1. Create the issue in GitHub using the Task template.
2. Copy the matching title, summary, and acceptance criteria from this file.
3. Add the issue to the GitHub Project.
4. Move status to `Todo`.
5. Start work from `develop` with the recommended branch prefix.
