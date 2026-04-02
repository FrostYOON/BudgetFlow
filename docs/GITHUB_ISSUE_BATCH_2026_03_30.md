# GitHub Issue Batch 2026-03-30

## Epic 1

Title:
- `Refine mobile-first information architecture`

Labels:
- `type:refactor`
- `area:web`
- `priority:p0`

Summary:
- Rework BudgetFlow's handheld navigation and page density so the app feels usable as a daily mobile budgeting product rather than a desktop-style control panel.

Suggested sub-issues:

### Issue A

Title:
- `Refactor mobile primary navigation and add More hub`

Labels:
- `type:refactor`
- `area:web`
- `priority:p0`

Project fields:
- `Status: In Progress`
- `Area: Web`
- `Priority: P0`
- `Target Milestone: MVP Polish`

Summary:
- Reduce the bottom navigation to the highest-frequency budgeting destinations and move secondary tools into a dedicated More hub.

Acceptance criteria:
- bottom navigation shows only core daily budgeting destinations
- secondary tools remain reachable within one tap from mobile
- sidebar navigation remains complete for larger screens
- route matching correctly highlights nested paths

Branch:
- `refactor/mobile-ia-and-roadmap`

Commits already prepared:
- `docs(product): sync delivery plan and current app scope`
- `refactor(web): simplify mobile primary navigation`

### Issue B

Title:
- `Redesign transaction mobile flow into list, detail sheet, and edit sheet`

Labels:
- `type:refactor`
- `area:web`
- `priority:p0`

Project fields:
- `Status: Todo`
- `Area: Web`
- `Priority: P0`
- `Target Milestone: MVP Polish`

Summary:
- Break the current all-in-one transaction screen into a faster handheld flow with clearer focus on browsing, adding, viewing, and editing entries.

Acceptance criteria:
- mobile list view prioritizes recent transactions and quick filters
- detail is shown in a focused surface instead of competing with the add form
- edit flow no longer overloads the same page section
- desktop keeps a productive multi-panel experience where useful

Suggested branch:
- `refactor/mobile-transaction-flow`

### Issue C

Title:
- `Compress dashboard mobile hierarchy and reduce header action overload`

Labels:
- `type:refactor`
- `area:web`
- `priority:p0`

Project fields:
- `Status: Todo`
- `Area: Web`
- `Priority: P0`
- `Target Milestone: MVP Polish`

Summary:
- Simplify the mobile dashboard so the first screen focuses on budget status, recent movement, and one primary next action.

Acceptance criteria:
- mobile header exposes fewer competing actions
- top metrics are prioritized for glanceability
- lower-priority surfaces move below the fold or behind secondary navigation
- dashboard remains informative for shared households

Suggested branch:
- `refactor/mobile-dashboard-hierarchy`

### Issue D

Title:
- `Simplify settings and management surfaces for handheld use`

Labels:
- `type:refactor`
- `area:web`
- `priority:p1`

Project fields:
- `Status: Todo`
- `Area: Web`
- `Priority: P1`
- `Target Milestone: MVP Polish`

Summary:
- Reduce management-page density in settings, accounts, and categories so handheld flows feel organized instead of administrative.

Suggested branch:
- `refactor/mobile-settings-surfaces`

## Epic 2

Title:
- `Sync delivery docs with implemented product scope`

Labels:
- `type:docs`
- `area:product`
- `priority:p0`

Suggested sub-issues:

### Issue E

Title:
- `Sync README and delivery docs with current product scope`

Labels:
- `type:docs`
- `area:product`
- `priority:p0`

Project fields:
- `Status: In Progress`
- `Area: Product`
- `Priority: P0`
- `Target Milestone: MVP Polish`

Summary:
- Update repository docs so they describe the real implemented product and the next execution queue, not the earlier scaffold state.

Branch:
- `refactor/mobile-ia-and-roadmap`

Commits already prepared:
- `docs(product): sync delivery plan and current app scope`

## PR Draft

Title:
- `refactor(web): simplify mobile navigation and sync delivery docs`

Body:

```md
## Summary
- reduce the mobile bottom navigation to core daily budgeting destinations
- add a More hub for secondary tools like settlements, reports, notifications, recurring, and settings
- sync product and delivery docs with the current implemented app scope

## Linked Issue
Closes #<issue-a>
Closes #<issue-e>

## Validation
- pnpm --filter @budgetflow/web lint
- pnpm --filter @budgetflow/web build

## Follow-ups
- redesign the transaction mobile flow into separate list/detail/edit surfaces
- compress dashboard mobile hierarchy and reduce action overload
```
