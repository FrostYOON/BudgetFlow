# Task Management Workflow

## KR Summary
- BudgetFlow의 작업 관리는 `GitHub Issues + GitHub Projects`를 기준으로 운영한다.
- 기능 단위 작업은 Issue로 만들고, 큰 기능은 부모 Issue와 sub-issue로 쪼갠다.
- 구현 브랜치는 항상 `develop`에서 따고, PR 본문에 `Closes #issue_number`를 넣어 머지 시 자동 종료되게 한다.
- 완료된 작업은 삭제하지 않고 `Closed` 상태로 관리하며, Project에서는 `Done` 후 필요 시 archive 한다.
- 문서는 `docs/`에 남기고, 실제 진행 상태의 source of truth는 GitHub Project로 본다.

## 1. Source of Truth

Use GitHub as the operational source of truth for engineering work:

- `GitHub Issues`: task definition
- `GitHub Projects`: planning, status, and prioritization
- `Pull Requests`: implementation and review
- `docs/`: specifications, product context, and technical decisions

Do not track active engineering work in multiple systems at once.

Recommended split:

- product specs and decisions: `docs/`
- active delivery status: GitHub Project
- implementation discussion: linked issue + PR

## 2. Issue Hierarchy

Use a simple two-level hierarchy.

- `Epic Issue`
  - large feature or milestone
  - examples: auth hardening, recurring automation, dashboard UI
- `Task Issue`
  - concrete implementation unit that can be completed in one branch/PR

Recommended pattern:

1. Create one parent issue for the feature area.
2. Break it into sub-issues for implementation tasks.
3. Link each PR to exactly one task issue when possible.

Examples:

- Epic: `Recurring transaction operations dashboard`
- Task: `Add recurring ops summary API`
- Task: `Add recurring ops admin UI`
- Task: `Add recurring execution failure notifications`

## 3. Project Board Status

Use the following status columns in GitHub Projects:

- `Todo`
- `In Progress`
- `In Review`
- `Blocked`
- `Done`

Status rules:

- move to `Todo` when the issue is refined and ready
- move to `In Progress` when a feature branch is created
- move to `In Review` when a PR is opened
- move to `Done` when the PR is merged or the issue is closed
- use `Blocked` only when an external dependency prevents progress

Completed work should not be deleted.
Close the issue and optionally archive the card in the project later.

## 4. Labels

Keep labels small and consistent.

Recommended labels:

- `type:feature`
- `type:bug`
- `type:chore`
- `type:docs`
- `type:refactor`
- `area:api`
- `area:web`
- `area:database`
- `area:infra`
- `area:product`
- `priority:p0`
- `priority:p1`
- `priority:p2`

Avoid label explosion.
If a label is not used repeatedly, do not create it.

## 5. Branch and PR Workflow

Every task issue should map to one feature branch.

Branch rules:

- create from `develop`
- use `feature/...`, `fix/...`, `refactor/...`, `docs/...`
- examples:
  - `feature/recurring-ops-dashboard`
  - `fix/auth-refresh-cookie`
  - `docs/task-management-workflow`

Pull request rules:

- one PR should solve one task issue whenever possible
- PR title follows Conventional Commit style
- PR body must include:
  - linked issue
  - scope summary
  - validation results
  - follow-up items if any

Always add an auto-close keyword in the PR body:

```md
Closes #123
```

That keeps the issue lifecycle tied to the merge lifecycle.

## 6. Definition of Done

A task is done only when all of the following are true:

- code is implemented
- validation is run
- review comments are addressed
- PR is merged into `develop`
- linked issue is closed
- project item is moved to `Done`

If follow-up work remains, create a new issue.
Do not keep a merged issue partially open to represent future tasks.

## 7. Recommended Cadence

Use a lightweight weekly planning rhythm.

- plan work into `Todo`
- pick a small number of issues into `In Progress`
- merge continuously into `develop`
- archive old `Done` items periodically

For a small team or solo workflow, keep WIP low.
Prefer finishing tasks over opening many parallel issues.

## 8. What To Avoid

- managing engineering tasks only in chat
- using one giant issue for a whole milestone
- keeping merged issues open "for reference"
- creating branches without linked issues
- tracking active work both in Notion and GitHub Projects

## 9. Recommended BudgetFlow Setup

For this repository, the recommended operational setup is:

1. One GitHub Project for active engineering delivery
2. Parent issues for milestones or large features
3. Task issues for implementable units
4. PRs linked with `Closes #issue_number`
5. `docs/` used for planning and technical reference only
