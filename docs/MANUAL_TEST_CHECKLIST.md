# Manual Test Checklist

## KR Summary
- 이 문서는 BudgetFlow MVP를 로컬에서 수동 검증할 때 쓰는 체크리스트다.
- 우선순위는 `auth -> onboarding -> transactions -> budgets -> recurring -> reports -> settings` 순서다.
- 각 항목은 한 번이라도 성공하면 통과로 본다.

## 1. Boot
- Run `pnpm docker:start`
- Run `pnpm prisma:generate`
- Run `pnpm dev`
- Confirm web opens at `http://localhost:3001`
- Confirm Swagger opens at `http://localhost:3000/docs`

## 2. Auth
- Sign up with a new email
- Confirm redirect into app flow
- Sign out
- Sign in again with the same account
- Confirm session persists across refresh

## 3. Household Onboarding
- Create a new household
- Confirm starter categories exist
- Confirm current workspace is selected
- Update household name, type, currency, and timezone from settings

## 4. Invite Flow
- Create an invite from settings
- Open the generated join link
- Confirm signed-out users are redirected to auth and then back to the invite
- Accept the invite with a second account
- Confirm the second account joins the household
- Resend an invite and confirm the link updates
- Revoke an invite and confirm it is no longer joinable

## 5. Transactions
- Add one expense transaction
- Add one income transaction
- Filter by type and visibility
- Edit an existing transaction
- Delete a transaction
- Restore the deleted transaction from the restore banner

## 6. Budgets
- Set a monthly budget
- Add category allocations under that total
- Confirm over-allocation is blocked
- Confirm dashboard reflects remaining budget

## 7. Recurring
- Create a recurring expense rule
- Create a recurring income rule
- Run a dry run from recurring page
- Run a manual execution
- Confirm execution history appears
- Pause a recurring rule

## 8. Reports And Dashboard
- Open dashboard and confirm summary values render
- Open monthly report and confirm category/payer/budget sections render
- Confirm insights appear when budget is near or over limit

## 9. Categories
- Add a custom category
- Edit the category
- Archive the category
- Restore the category from archived list

## 10. Settings
- Update account name, locale, timezone
- Update household nickname
- Confirm owner-only controls are hidden or read-only for members

## 11. Final Smoke Check
- Refresh each major page:
  - `/app/dashboard`
  - `/app/transactions`
  - `/app/budgets`
  - `/app/recurring`
  - `/app/reports`
  - `/app/settings`
- Confirm toast messages appear for success and failure cases
- Confirm mobile viewport works at roughly `390x844`
