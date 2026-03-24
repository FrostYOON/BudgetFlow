# BudgetFlow API Spec Draft

## KR Summary

- 이 문서는 BudgetFlow MVP를 위한 REST API 초안이다.
- 핵심 축은 `인증`, `워크스페이스`, `멤버/초대`, `카테고리`, `거래`, `예산`, `리포트`, `반복거래`, `인사이트`다.
- 모든 공유 데이터는 `workspaceId` 기준으로 조회하고 수정한다.
- 예산은 `월 전체 예산`이 먼저이며, 카테고리 예산은 그 안에 배정되는 구조로 설계한다.
- 이 문서는 개발 초기 단계에서 프론트엔드와 백엔드가 같은 언어로 이야기할 수 있게 만드는 목적의 초안이다.

## 1. API Principles

- Style: REST JSON API
- Base path: `/api/v1`
- Auth: bearer access token
- Time format: ISO 8601
- Currency amount: decimal as string in API payloads
- Soft-deleted transactions should not appear in default list APIs

## 2. Authentication Strategy

### Recommended MVP approach
- Email/password authentication first
- Social login can be added later
- Access token + refresh token model

### Common auth headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

## 3. Standard Response Shape

### Success

```json
{
  "data": {},
  "meta": {}
}
```

### Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Category budget total exceeds monthly budget.",
    "details": {}
  }
}
```

## 4. Auth APIs

## 4.1 Sign Up

`POST /api/v1/auth/sign-up`

Request:

```json
{
  "email": "minji@example.com",
  "password": "StrongPassword123!",
  "name": "Minji"
}
```

Response:

```json
{
  "data": {
    "user": {
      "id": "usr_123",
      "email": "minji@example.com",
      "name": "Minji",
      "locale": "ko-KR",
      "timezone": "Asia/Seoul"
    },
    "tokens": {
      "accessToken": "<token>",
      "refreshToken": "<token>"
    }
  }
}
```

## 4.2 Sign In

`POST /api/v1/auth/sign-in`

Request:

```json
{
  "email": "minji@example.com",
  "password": "StrongPassword123!"
}
```

## 4.3 Refresh Token

`POST /api/v1/auth/refresh`

Request:

```json
{
  "refreshToken": "<token>"
}
```

## 4.4 Get Me

`GET /api/v1/auth/me`

Response:

```json
{
  "data": {
    "id": "usr_123",
    "email": "minji@example.com",
    "name": "Minji",
    "locale": "ko-KR",
    "timezone": "Asia/Seoul"
  }
}
```

## 4.5 Sign Out

`POST /api/v1/auth/sign-out`

Request:

```json
{
  "refreshToken": "<token>"
}
```

## 5. Workspace APIs

## 5.1 Create Workspace

`POST /api/v1/workspaces`

Request:

```json
{
  "name": "Minji & Jisu Home",
  "type": "COUPLE",
  "baseCurrency": "KRW",
  "timezone": "Asia/Seoul"
}
```

Response:

```json
{
  "data": {
    "id": "ws_123",
    "name": "Minji & Jisu Home",
    "type": "COUPLE",
    "baseCurrency": "KRW",
    "timezone": "Asia/Seoul",
    "ownerUserId": "usr_123"
  }
}
```

## 5.2 List My Workspaces

`GET /api/v1/workspaces`

Response:

```json
{
  "data": [
    {
      "id": "ws_123",
      "name": "Minji & Jisu Home",
      "type": "COUPLE",
      "memberRole": "OWNER"
    }
  ]
}
```

## 5.3 Get Workspace Detail

`GET /api/v1/workspaces/:workspaceId`

Response:

```json
{
  "data": {
    "id": "ws_123",
    "name": "Minji & Jisu Home",
    "type": "COUPLE",
    "baseCurrency": "KRW",
    "timezone": "Asia/Seoul",
    "members": [
      {
        "userId": "usr_123",
        "name": "Minji",
        "role": "OWNER",
        "status": "ACTIVE"
      }
    ]
  }
}
```

## 5.4 Update Workspace

`PATCH /api/v1/workspaces/:workspaceId`

Request:

```json
{
  "name": "BudgetFlow Home",
  "timezone": "Asia/Seoul"
}
```

## 6. Invite and Member APIs

## 6.1 Invite Member

`POST /api/v1/workspaces/:workspaceId/invites`

Request:

```json
{
  "email": "jisu@example.com",
  "role": "MEMBER"
}
```

Response:

```json
{
  "data": {
    "id": "inv_123",
    "email": "jisu@example.com",
    "role": "MEMBER",
    "status": "INVITED",
    "expiresAt": "2026-03-31T23:59:59.000Z"
  }
}
```

## 6.2 List Invites

`GET /api/v1/workspaces/:workspaceId/invites`

## 6.3 Accept Invite

`POST /api/v1/workspace-invites/:token/accept`

Response:

```json
{
  "data": {
    "workspaceId": "ws_123",
    "memberStatus": "ACTIVE"
  }
}
```

## 6.4 List Members

`GET /api/v1/workspaces/:workspaceId/members`

## 6.5 Update Member Role

`PATCH /api/v1/workspaces/:workspaceId/members/:userId`

Request:

```json
{
  "role": "MEMBER"
}
```

## 6.6 Remove Member

`DELETE /api/v1/workspaces/:workspaceId/members/:userId`

Notes:
- Only owner can remove members in MVP
- Owner transfer can be added later if needed

## 7. Category APIs

## 7.1 List Categories

`GET /api/v1/workspaces/:workspaceId/categories?type=EXPENSE`

## 7.2 Create Category

`POST /api/v1/workspaces/:workspaceId/categories`

Request:

```json
{
  "name": "Groceries",
  "type": "EXPENSE",
  "color": "#4E8B57",
  "icon": "cart"
}
```

## 7.3 Update Category

`PATCH /api/v1/workspaces/:workspaceId/categories/:categoryId`

## 7.4 Archive Category

`DELETE /api/v1/workspaces/:workspaceId/categories/:categoryId`

Notes:
- This should soft-archive category rather than hard-delete

## 8. Transaction APIs

## 8.1 Create Transaction

`POST /api/v1/workspaces/:workspaceId/transactions`

Request:

```json
{
  "type": "EXPENSE",
  "visibility": "SHARED",
  "amount": "52000.00",
  "currency": "KRW",
  "transactionDate": "2026-03-24",
  "categoryId": "cat_groceries",
  "memo": "Mart run",
  "paidByUserId": "usr_jisu"
}
```

Response:

```json
{
  "data": {
    "id": "txn_123",
    "workspaceId": "ws_123",
    "type": "EXPENSE",
    "visibility": "SHARED",
    "amount": "52000.00",
    "currency": "KRW",
    "transactionDate": "2026-03-24",
    "categoryId": "cat_groceries",
    "memo": "Mart run",
    "createdByUserId": "usr_minji",
    "paidByUserId": "usr_jisu",
    "createdAt": "2026-03-24T12:00:00.000Z"
  }
}
```

## 8.2 List Transactions

`GET /api/v1/workspaces/:workspaceId/transactions`

Supported query params:
- `from`
- `to`
- `type`
- `visibility`
- `categoryId`
- `paidByUserId`
- `cursor`
- `limit`

Example:

`GET /api/v1/workspaces/ws_123/transactions?from=2026-03-01&to=2026-03-31&visibility=SHARED&limit=20`

## 8.3 Get Transaction Detail

`GET /api/v1/workspaces/:workspaceId/transactions/:transactionId`

## 8.4 Update Transaction

`PATCH /api/v1/workspaces/:workspaceId/transactions/:transactionId`

## 8.5 Delete Transaction

`DELETE /api/v1/workspaces/:workspaceId/transactions/:transactionId`

Notes:
- This should soft-delete by setting `isDeleted = true`

## 9. Budget APIs

## 9.1 Upsert Monthly Budget

`PUT /api/v1/workspaces/:workspaceId/budgets/:year/:month`

Purpose:
- Create or update one monthly budget container
- Set total budget first

Request:

```json
{
  "totalBudgetAmount": "2000000.00"
}
```

Response:

```json
{
  "data": {
    "id": "bud_2026_03",
    "workspaceId": "ws_123",
    "year": 2026,
    "month": 3,
    "totalBudgetAmount": "2000000.00",
    "allocatedAmount": "1200000.00",
    "unallocatedAmount": "800000.00"
  }
}
```

## 9.2 Get Monthly Budget

`GET /api/v1/workspaces/:workspaceId/budgets/:year/:month`

Response:

```json
{
  "data": {
    "year": 2026,
    "month": 3,
    "totalBudgetAmount": "2000000.00",
    "allocatedAmount": "1200000.00",
    "unallocatedAmount": "800000.00",
    "categories": [
      {
        "categoryId": "cat_groceries",
        "categoryName": "Groceries",
        "plannedAmount": "600000.00",
        "actualAmount": "420000.00",
        "remainingAmount": "180000.00",
        "progressPct": 70
      }
    ]
  }
}
```

## 9.3 Upsert Category Budgets

`PUT /api/v1/workspaces/:workspaceId/budgets/:year/:month/categories`

Request:

```json
{
  "categories": [
    {
      "categoryId": "cat_groceries",
      "plannedAmount": "600000.00",
      "alertThresholdPct": 80
    },
    {
      "categoryId": "cat_transport",
      "plannedAmount": "200000.00",
      "alertThresholdPct": 80
    }
  ]
}
```

Business rules:
- total of category budgets must not exceed `totalBudgetAmount`
- categories should be expense categories for expense budgeting

## 9.4 Delete One Category Budget

`DELETE /api/v1/workspaces/:workspaceId/budgets/:year/:month/categories/:categoryId`

## 10. Dashboard and Report APIs

## 10.1 Get Dashboard Summary

`GET /api/v1/workspaces/:workspaceId/dashboard?year=2026&month=3`

Response:

```json
{
  "data": {
    "period": {
      "year": 2026,
      "month": 3
    },
    "summary": {
      "totalIncome": "3500000.00",
      "totalExpense": "1250000.00",
      "sharedExpense": "980000.00",
      "personalExpense": "270000.00",
      "monthlyBudget": "2000000.00",
      "allocatedBudget": "1200000.00",
      "unallocatedBudget": "800000.00",
      "remainingBudget": "750000.00"
    },
    "topCategories": [
      {
        "categoryId": "cat_groceries",
        "name": "Groceries",
        "amount": "420000.00"
      }
    ],
    "recentTransactions": [
      {
        "id": "txn_123",
        "amount": "52000.00",
        "categoryName": "Groceries",
        "paidByName": "Jisu"
      }
    ],
    "insights": [
      {
        "id": "ins_123",
        "type": "BUDGET_WARNING",
        "title": "Groceries reached 70% of budget",
        "body": "Spending is rising faster than last month."
      }
    ]
  }
}
```

## 10.2 Get Monthly Report

`GET /api/v1/workspaces/:workspaceId/reports/monthly?year=2026&month=3`

Suggested response sections:
- summary
- categoryBreakdown
- payerBreakdown
- budgetProgress
- recurringUpcoming

## 11. Recurring Transaction APIs

## 11.1 Create Recurring Transaction

`POST /api/v1/workspaces/:workspaceId/recurring-transactions`

Request:

```json
{
  "type": "EXPENSE",
  "visibility": "SHARED",
  "amount": "55000.00",
  "currency": "KRW",
  "categoryId": "cat_subscription",
  "memo": "Netflix",
  "paidByUserId": "usr_jisu",
  "repeatUnit": "MONTHLY",
  "repeatInterval": 1,
  "dayOfMonth": 25,
  "startDate": "2026-03-25"
}
```

## 11.2 List Recurring Transactions

`GET /api/v1/workspaces/:workspaceId/recurring-transactions`

## 11.3 Update Recurring Transaction

`PATCH /api/v1/workspaces/:workspaceId/recurring-transactions/:recurringTransactionId`

## 11.4 Deactivate Recurring Transaction

`DELETE /api/v1/workspaces/:workspaceId/recurring-transactions/:recurringTransactionId`

Notes:
- This should set `isActive = false`

## 12. Insight APIs

## 12.1 List Active Insights

`GET /api/v1/workspaces/:workspaceId/insights`

## 12.2 Dismiss Insight

`POST /api/v1/workspaces/:workspaceId/insights/:insightId/dismiss`

## 13. Validation Rules

### Transaction
- `amount` must be greater than zero
- `paidByUserId` must be a workspace member
- `categoryId` must belong to the same workspace
- `type` must match category type

### Budget
- `month` must be between 1 and 12
- category budget total must not exceed monthly total budget
- monthly budget should be unique per workspace/year/month

### Invite
- only owners can create invites in MVP
- invite token must not be expired

## 14. Recommended MVP Endpoint Order

1. `POST /auth/sign-up`
2. `POST /auth/sign-in`
3. `GET /auth/me`
4. `POST /workspaces`
5. `GET /workspaces`
6. `POST /workspaces/:workspaceId/invites`
7. `GET /workspaces/:workspaceId/categories`
8. `POST /workspaces/:workspaceId/transactions`
9. `GET /workspaces/:workspaceId/transactions`
10. `PUT /workspaces/:workspaceId/budgets/:year/:month`
11. `PUT /workspaces/:workspaceId/budgets/:year/:month/categories`
12. `GET /workspaces/:workspaceId/dashboard`
13. `GET /workspaces/:workspaceId/reports/monthly`

## 15. Recommended Next Step

Choose one of the following:
- convert this into OpenAPI YAML
- implement NestJS route/module structure
- create frontend page and API client mapping
