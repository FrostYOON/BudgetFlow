# BudgetFlow Product Plan

## KR Summary

- 이 문서는 BudgetFlow의 초기 제품 방향과 MVP 범위를 정리한 기획서다.
- 제품의 1차 타깃은 커플과 가족이며, 함께 생활비를 관리하는 공유형 가계부 SaaS를 목표로 한다.
- 회사/팀 경비 관리 기능은 MVP에서 제외하고, 대신 나중에 확장 가능한 `workspace` 구조를 기준으로 설계한다.
- 핵심 가치는 `함께 쓰는 돈을 한눈에 보고`, `빠르게 기록하고`, `예산을 지키도록 돕는 것`이다.
- MVP에는 회원가입, 워크스페이스 생성, 멤버 초대, 거래 입력, 카테고리 관리, 월 예산, 대시보드, 리포트, 반복 지출 기능이 포함된다.
- 초기 차별점은 개인 가계부가 아니라 `관계를 위한 공유형 돈 관리 경험`에 있다.
- 문서 본문은 영어를 기준으로 유지해 개발과 확장에 유리하게 가져간다.

## 1. Product Summary

### Product One-liner
Shared household budgeting for couples and families who want to manage money together without friction.

### Initial Positioning
- Primary target: couples and married partners
- Secondary target: families
- Expandable target: roommates and small living groups
- Excluded for MVP: company/team expense management

### Why Company/Team Is Excluded for Now
- Household budgeting focuses on daily money visibility, shared planning, and emotional trust.
- Team expense management quickly requires approvals, reimbursements, receipts, audit logs, and stricter permissions.
- Mixing both in the MVP would blur product identity and slow delivery.
- We should still design the data model around a shared workspace so future expansion stays possible.

## 2. Problem Definition

Users who share living expenses often struggle with:
- not knowing who paid for what
- not having a single shared source of truth
- missing monthly budget goals
- arguing over money because spending is not visible in real time
- tracking subscriptions, recurring bills, and category overruns too late

## 3. Target Users

### Primary Persona: Couple
- Lives together or is preparing for marriage
- Shares food, rent, utilities, dates, travel, and subscriptions
- Wants lightweight entry, shared visibility, and budget awareness

### Secondary Persona: Family
- One or more family members contribute to household expenses
- Needs shared records, category tracking, and monthly planning

### Future Persona: Roommates
- Shares rent, bills, groceries, and common purchases
- May need simple split and settlement tracking

## 4. Core Value Proposition

BudgetFlow helps people who live together:
- record shared income and spending in one place
- see where the household budget is going at a glance
- understand who paid and what category is overspending
- build healthy habits through simple insights and recurring expense tracking

## 5. Product Principles

- Shared-first: every important action happens inside a shared workspace
- Fast input: recording spending should take less than 10 seconds
- Calm clarity: the product should reduce money stress, not add admin work
- Insight over bookkeeping: raw entries matter, but helpful summaries matter more
- Flexible ownership: a transaction should support payer, participants, and visibility

## 6. MVP Scope

### Must Have
- Email/social sign-up and login
- Workspace creation
- Invite partner or family member by link or email
- Member roles: owner, member
- Manual transaction entry
- Transaction fields:
  - type: income or expense
  - amount
  - date
  - category
  - memo
  - payer
  - visibility: shared or personal
- Shared category management
- Monthly budget setting by category
- Dashboard with this month summary
- Monthly report view
- Recurring expense registration
- Basic notifications or insight cards

### Nice to Have if Time Allows
- Receipt image attachment
- CSV import
- Simple settlement summary
- Push notifications
- Shared savings goal

### Explicitly Out of Scope for MVP
- Company/team approvals
- reimbursement workflow
- advanced accounting
- bank account auto-sync
- tax/reporting features
- complex role hierarchy

## 7. Key User Flows

### Flow 1: Shared Setup
1. User signs up
2. User creates a workspace
3. User names the workspace
4. User invites partner or family member
5. Workspace dashboard opens with onboarding tips

### Flow 2: First Budget Setup
1. User selects current month
2. User enters total or category budgets
3. System suggests starter categories
4. Dashboard starts tracking budget progress

### Flow 3: Add Shared Expense
1. User taps add transaction
2. User enters amount, category, date, payer, and memo
3. User marks it as shared
4. Transaction appears in timeline and updates dashboard totals

### Flow 4: Check Monthly Status
1. User opens dashboard
2. User sees total spend, remaining budget, top categories, and recent transactions
3. User taps report for more detailed breakdown
4. System shows overspent categories and recurring bills

### Flow 5: Review Insights
1. System detects a pattern such as category overspend or an upcoming recurring bill
2. User sees a simple insight card
3. User moves to relevant category or transaction list

## 8. Key Screens

### 1. Landing / Marketing
- product message
- target use cases
- pricing teaser
- sign-up CTA

### 2. Onboarding
- account creation
- workspace setup
- invite member
- starter categories

### 3. Dashboard
- this month total income
- this month total expense
- remaining budget
- category budget progress
- recent shared transactions
- insight cards

### 4. Transactions
- list view
- filters by month, member, category, shared/personal
- add/edit transaction

### 5. Budget
- monthly budget by category
- actual vs planned
- overspend indicators

### 6. Reports
- monthly trend
- category breakdown
- payer breakdown
- recurring expense list

### 7. Workspace Settings
- members
- roles
- categories
- recurring expenses

## 9. Differentiation Ideas

These should guide design even if not all launch in MVP:
- shared household focus instead of solo bookkeeping
- payer visibility without complex accounting language
- gentle insight cards for emotional clarity
- recurring living-cost tracking
- shared and personal spending in one timeline with simple visibility rules

## 10. Recommended Data Model

### Main Entities
- User
- Workspace
- WorkspaceMember
- Transaction
- Category
- BudgetMonth
- BudgetCategory
- RecurringTransaction
- Insight

### Modeling Direction
- Every shared feature belongs to a workspace.
- Users can belong to multiple workspaces in the future.
- Transactions should store both `createdBy` and `paidBy`.
- Keep `visibility` flexible so personal and shared spending can coexist.
- Avoid company-specific entities for now, but keep workspace/member naming generic enough for expansion.

## 11. Monetization Hypothesis

### Free
- one workspace
- manual transaction entry
- monthly dashboard
- basic reports

### Premium
- advanced insights
- recurring transaction automation
- receipt attachments
- multi-month trend analysis
- multiple workspaces
- savings goals

## 12. Success Metrics for MVP

- workspace creation rate
- invite acceptance rate
- first-week transaction count
- percentage of workspaces with 2 or more active members
- monthly active workspaces
- budget setup completion rate
- 4-week retention

## 13. Suggested Tech/Product Direction

### Product Architecture
- Design around workspace-based collaboration from day one
- Keep permissions simple in V1
- Prefer fast manual input before heavy automation

### UX Direction
- Mobile-first
- Timeline plus dashboard structure
- Calm and trustworthy tone
- Minimal friction for repeated actions

## 14. 8-Week MVP Roadmap

### Week 1
- finalize product scope
- define user flows
- create wireframes
- set brand direction

### Week 2
- define DB schema
- set up frontend/backend project
- implement auth and workspace model

### Week 3
- member invite flow
- transaction CRUD
- category management

### Week 4
- budget setup and tracking
- dashboard summary cards

### Week 5
- monthly report
- recurring transaction support

### Week 6
- onboarding polish
- insight cards
- settings page

### Week 7
- QA
- seed data
- analytics

### Week 8
- landing page
- pricing page
- beta release

## 15. Recommended First Release Statement

BudgetFlow is a shared household budgeting app for couples and families who want one clear place to track spending, manage budgets, and build healthier money habits together.

## 16. Next Decisions We Should Make

1. Should the MVP support both shared and personal transactions from day one?
2. Should settlement be included in MVP or delayed?
3. What is the default category set for couples/families?
4. What visual tone should the brand use: warm lifestyle, clean finance, or modern productivity?
5. Which platform comes first: web only, or web plus mobile-responsive PWA?
