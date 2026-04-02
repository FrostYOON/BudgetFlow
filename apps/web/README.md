# BudgetFlow Web

Next.js App Router frontend for BudgetFlow.

## Local Run

```bash
cp apps/web/.env.example apps/web/.env.local
pnpm dev:web
```

Default local URL:

- web: `http://localhost:3001`

## Current App Scope

Implemented route groups include:

- public marketing and auth entry
- personal-first onboarding plus shared workspace creation
- dashboard
- transactions
- budgets
- settlements
- recurring automation console
- reports with export and print
- notifications
- settings, categories, and financial accounts

## Current Frontend Priority

The current UI priority is mobile-first refinement:

- reduce bottom navigation overload
- move secondary tools behind a clearer handheld information architecture
- compress dense form-heavy screens into faster mobile flows

See the repo-level execution plan:

- [docs/DELIVERY_EXECUTION_PLAN.md](/Users/yoon-yongseol/WorkSpace/BudgetFlow/docs/DELIVERY_EXECUTION_PLAN.md)
- [docs/USER_ONBOARDING_GUIDE.md](/Users/yoon-yongseol/WorkSpace/BudgetFlow/docs/USER_ONBOARDING_GUIDE.md)
- [docs/USER_ONBOARDING_GUIDE.ko.md](/Users/yoon-yongseol/WorkSpace/BudgetFlow/docs/USER_ONBOARDING_GUIDE.ko.md)
- [docs/FEATURE_VERIFICATION_2026_03_31.md](/Users/yoon-yongseol/WorkSpace/BudgetFlow/docs/FEATURE_VERIFICATION_2026_03_31.md)
