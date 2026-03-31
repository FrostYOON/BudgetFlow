# Delivery Execution Plan

## KR Summary

- 이 문서는 2026-03-30 기준 BudgetFlow의 실제 구현 상태와 다음 실행 큐를 정리한다.
- 목적은 `현재 상태 파악`, `다음 GitHub Issue 정의`, `브랜치/커밋 전략 정렬`이다.
- active engineering source of truth는 여전히 GitHub Issues + GitHub Projects로 유지한다.
- 이 문서는 그 작업을 생성하기 전 기준 문서다.

## 1. Current Product State

The repository has already moved beyond MVP scaffolding.
The following slices are implemented in code:

- auth: sign-up, sign-in, refresh, sign-out, session management
- personal-first onboarding: personal workspace is provisioned on sign-up
- shared workspace onboarding: create additional couple, family, or roommate spaces
- dashboard: monthly summary, budget usage, settlement summary, insights
- transactions: create, browse, filter, detail, update, soft delete/restore flows
- budgets: monthly total, category allocation, copy previous month, template save/apply
- settlements: shared balance summary and suggested transfer flows
- recurring: recurring transaction CRUD, manual run, ops summary, execution history
- reports: monthly report, CSV export, print view
- notifications: read, read all, drill-down links
- settings: account, security, invites, categories, financial accounts
- infra: Docker Postgres, Prisma migrations, API e2e, web e2e, CI validation

## 2. Current Gaps

The largest remaining problems are now structural rather than purely functional.

- mobile navigation is overloaded when every major tool is exposed in the bottom bar
- some pages still feel like dense admin consoles instead of mobile-first product flows
- documentation and backlog files lag behind implemented reality
- the product has strong coverage, but the information hierarchy is not yet tight enough for everyday mobile use
- GitHub issue planning is still based on older backlog assumptions

## 3. Recommended Issue Queue

Create the following issues in order.

### Epic: Mobile-first product refinement

- `type:refactor`
- `area:web`
- `priority:p0`

Suggested task issues:

1. `Refactor mobile primary navigation and add More hub`
2. `Redesign transaction mobile flow into list, detail sheet, and edit sheet`
3. `Compress dashboard mobile hierarchy and reduce header action overload`
4. `Simplify settings and management surfaces for handheld use`

### Epic: Docs and delivery sync

- `type:docs`
- `area:product`
- `priority:p0`

Suggested task issues:

1. `Sync README and web docs with implemented product scope`
2. `Refresh backlog from initial MVP tasks to current delivery queue`
3. `Document branch, commit, and PR slicing rules for multi-part delivery`

### Epic: Product completion after IA cleanup

- `type:feature`
- `area:web`
- `priority:p1`

Suggested task issues:

1. `Add workspace-type starter budget onboarding`
2. `Add stronger insight cards for overspend, settlement due, and recurring events`
3. `Choose one import path: CSV import or receipt attachment`

## 4. Branch Strategy

Use one branch per task issue.

Recommended first sequence:

1. `refactor/mobile-ia-and-roadmap`
   - scope: mobile nav reduction, More hub, docs sync
2. `refactor/mobile-transaction-flow`
   - scope: transaction list/detail/edit mobile split
3. `refactor/mobile-dashboard-hierarchy`
   - scope: dashboard header compression and card priority
4. `docs/current-delivery-sync`
   - scope: final backlog/README cleanup if separated from UI work

If a branch starts getting too large, stop and split the next concern into a new issue and branch.

## 5. Commit Strategy

Use small intentional commits inside each branch.

Recommended commit pattern for UI refactors:

1. `docs(product): sync current delivery state and execution plan`
2. `refactor(web): simplify mobile primary navigation`
3. `feat(web): add More hub for secondary budgeting tools`
4. `test(web): update navigation expectations if route coverage changes`

Use PR titles in Conventional Commit style and keep one issue closed per PR whenever possible.

## 6. GitHub Project Flow

For each planned issue:

1. create the issue
2. add it to `BudgetFlow Delivery`
3. set `Status=Todo`
4. set `Priority` and `Area`
5. when branch is created, move to `In Progress`
6. when PR opens, move to `In Review`
7. when merged, close the issue and move to `Done`

## 7. Immediate Execution Target

The current branch should be treated as the first task slice:

- mobile primary navigation cleanup
- secondary-tool consolidation into a `More` route
- docs sync so the next GitHub issue wave matches reality

Follow-up branches should not start until this slice is committed and validated.
