# GitHub Projects Setup

## KR Summary
- Project는 BudgetFlow의 실제 작업 상태판으로 사용한다.
- 상태 컬럼은 `Todo / In Progress / In Review / Blocked / Done`으로 고정한다.
- 필드는 최소한 `Status`, `Priority`, `Area`, `Target Milestone` 정도만 둔다.
- 이슈 생성 시 Project에 넣고, PR 오픈/머지 시 상태를 수동 또는 자동화로 갱신한다.
- 완료된 항목은 삭제하지 않고 `Done` 후 archive 한다.

## 1. Project Scope

Create one main GitHub Project for active delivery.

Suggested name:

- `BudgetFlow Delivery`

Use this project for:

- engineering delivery status
- short-term prioritization
- sprint or weekly execution

Do not use it as a long-form product documentation system.

## 2. Recommended Fields

Create these fields in the project.

### Status

Type: single select

Values:

- `Todo`
- `In Progress`
- `In Review`
- `Blocked`
- `Done`

### Priority

Type: single select

Values:

- `P0`
- `P1`
- `P2`

### Area

Type: single select

Values:

- `API`
- `Web`
- `Database`
- `Infra`
- `Product`

### Target Milestone

Type: text or single select

Examples:

- `MVP`
- `Auth Hardening`
- `Recurring Automation`
- `Dashboard UI`

## 3. Item Creation Rules

Add every implementation issue to the project when it is created.

Recommended rules:

- epics and tasks both go into the project
- only implementation issues go into the board
- docs-only references can stay outside if they are not active work

## 4. Suggested Automations

Use GitHub Projects built-in automation for at least:

- add new issues to project
- set new items to `Todo`
- when PR is opened, move linked item to `In Review`
- when issue or PR is closed, move item to `Done`

If some status changes are not covered by built-in automations, update them manually.

## 5. Issue Naming Convention

Use clear, implementation-oriented titles.

Good examples:

- `Add recurring ops summary API`
- `Implement dashboard budget overview card`
- `Add transaction update endpoint`

Avoid vague titles:

- `Recurring improvements`
- `Fix stuff`
- `Dashboard work`

## 6. PR Convention

Recommended PR body structure:

```md
## Summary
- add recurring ops summary API
- add service and DTO coverage

## Linked Issue
Closes #123

## Validation
- pnpm --filter @budgetflow/api lint
- pnpm --filter @budgetflow/api build
- pnpm --filter @budgetflow/api test -- --runInBand

## Follow-ups
- add ops/admin UI
```

## 7. Daily Operating Rule

Use this simple rule set:

1. Pick one `Todo` issue.
2. Move it to `In Progress`.
3. Create a feature branch from `develop`.
4. Open a PR and move it to `In Review`.
5. Merge, close, and move to `Done`.

That is the complete loop.

## 8. BudgetFlow Initial Backlog Suggestion

The next items that fit this setup are:

- `Add recurring ops admin UI`
- `Add transaction update API`
- `Add starter category seed flow`
- `Add e2e coverage for auth and workspace onboarding`
- `Add notification flow for recurring execution failures`
