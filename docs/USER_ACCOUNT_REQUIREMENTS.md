# User Account Requirements

## KR Summary
- BudgetFlow의 회원 정보는 `계정 식별`, `개인 설정`, `워크스페이스 멤버 정보`, `운영/보안 정보`로 나눠서 관리한다.
- 사용자 공통 정보는 `users`에 두고, 공유 가계부 맥락 정보는 `workspace_members`로 분리한다.
- MVP 필수 필드는 `email`, `passwordHash`, `name`, `locale`, `timezone` 이다.
- `nickname`, `role`, `status`는 사용자 자체 정보가 아니라 워크스페이스별 멤버 정보다.
- 전화번호, 생년월일, 계좌/카드 정보 같은 민감 정보는 MVP에서 제외한다.

## 1. Goal

Define the account fields BudgetFlow needs for a shared budgeting product focused on couples, families, and roommates.

The key rule is simple:

- global user identity belongs in `users`
- workspace-specific identity belongs in `workspace_members`

This separation keeps the account model small while preserving the shared-household context.

## 2. Required User Fields

These fields should exist on the core `users` table.

| Field | Required | Why it matters |
| --- | --- | --- |
| `email` | Yes | Primary login identifier, invite matching, session ownership |
| `passwordHash` | Yes | Local authentication |
| `name` | Yes | Human-readable identity across the product |
| `locale` | Yes | Date, number, and language formatting |
| `timezone` | Yes | Recurring execution, report timing, and date boundaries |
| `profileImageUrl` | No | Optional avatar for member lists and activity context |

## 3. Workspace-Specific Member Fields

These should stay on `workspace_members`, not `users`.

| Field | Required | Why it belongs to membership |
| --- | --- | --- |
| `role` | Yes | Authorization depends on workspace context |
| `status` | Yes | Invite, active, or left state is membership-specific |
| `nickname` | No | The same person can be shown differently in different workspaces |
| `joinedAt` | No | Household membership timeline belongs to the workspace relationship |

Example:

- one user can appear as `Jisu` in a couple workspace
- the same user can appear as `Mom` in a family workspace

That is why nickname must not live on `users`.

## 4. Operational and Security Fields

These are not profile fields, but they are required for a production-ready account system.

| Field | Location | Purpose |
| --- | --- | --- |
| `authSessions` | `auth_sessions` | Multi-device refresh token sessions |
| `userAgent` | `auth_sessions` | Session/device traceability |
| `ipAddress` | `auth_sessions` | Security investigation and device audit |
| `lastUsedAt` | `auth_sessions` | Session freshness and cleanup |
| `revokedAt` | `auth_sessions` | Logout and token revocation state |

## 5. Recommended Next Fields

These are useful, but not necessary for the current MVP schema.

| Field | Recommended timing | Why |
| --- | --- | --- |
| `notificationPreferences` | After core transaction UI | Needed for reminder and failure notification controls |
| `onboardingCompletedAt` | After onboarding UX is added | Useful for first-run branching |
| `lastActiveWorkspaceId` | Optional | Can simplify cross-device workspace restore |
| `preferredCurrency` | Optional | Only needed if personal display currency differs from workspace currency |

## 6. Fields To Avoid In MVP

These fields increase sensitivity, compliance risk, or implementation cost without helping the current product direction.

| Field | Reason to avoid now |
| --- | --- |
| `phoneNumber` | Not required for email-based auth or household collaboration |
| `birthDate` | Sensitive and not needed for budgeting workflows |
| `gender` | Not relevant to the product function |
| `address` | Unnecessary for a shared budgeting MVP |
| `salary` | Better modeled as transactions, not profile metadata |
| `bankAccountNumber` | High-risk financial data |
| `cardNumber` | High-risk financial data |

## 7. BudgetFlow Recommendation

BudgetFlow should keep the user model lean.

Recommended account structure:

- `users`
  - `email`
  - `passwordHash`
  - `name`
  - `profileImageUrl`
  - `locale`
  - `timezone`
- `workspace_members`
  - `role`
  - `status`
  - `nickname`
  - `joinedAt`
- `auth_sessions`
  - session and device management fields

## 8. Current Schema Fit

The current Prisma schema already aligns well with this model:

- `User` covers identity and preferences
- `WorkspaceMember` covers household-specific membership
- `AuthSession` covers production-grade session management

That means the current direction is correct.

The next logical product step is not adding more account fields, but building:

1. account settings UI
2. workspace member settings UI
3. notification preference controls
