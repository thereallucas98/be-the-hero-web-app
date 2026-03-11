# Plan: Complete Auth & User/Org

**Date**: 2026-03-11
**Phase**: PLANNING
**Status**: Pending Approval

---

## Objective

Complete the 6 sub-features that have schema support but no routes:
- **0.1** Password reset (forgot-password + reset-password)
- **0.2** Email verification (verify-email + resend-verification)
- **0.3** User profile update (PATCH /me + PATCH /me/password)
- **0.4** Workspace member role update (PATCH /workspaces/:id/members/:memberId)
- **0.5** City coverage CRUD (GET/POST /workspaces/:id/city-coverage + DELETE .../[coverageId])
- **0.6** Workspace deactivation (DELETE /workspaces/:id)

---

## Architecture Overview

```
lib/auth.ts
  + generateToken()
  + signEmailVerifyToken(userId)
  + verifyEmailVerifyToken(token)

UserRepository (+6 methods)
  + findByResetToken(hashedToken)
  + setResetToken(userId, hashedToken, expiresAt)
  + clearResetToken(userId)
  + setEmailVerified(userId)
  + updateProfile(userId, { fullName?, phone? })
  + updatePassword(userId, passwordHash)

WorkspaceRepository (+5 methods)
  + updateMemberRole(workspaceId, memberId, role)
  + listCityCoverage(workspaceId)
  + addCityCoverage(workspaceId, cityPlaceId)
  + removeCityCoverage(workspaceId, coverageId)
  + deactivate(workspaceId)

AdoptionRepository (+1 method)
  + hasActivePendingFollowUps(workspaceId)

Schemas
  auth.schema.ts   + ForgotPasswordSchema, ResetPasswordSchema, VerifyEmailSchema
  workspace.schema.ts  + UpdateMemberRoleSchema, AddCityCoverageSchema
  me.schema.ts     NEW — UpdateMeSchema, ChangePasswordSchema

Use Cases (11 new files)
  auth/forgot-password.use-case.ts
  auth/reset-password.use-case.ts
  auth/verify-email.use-case.ts
  auth/resend-verification.use-case.ts
  me/update-me.use-case.ts
  me/change-password.use-case.ts
  workspaces/update-workspace-member-role.use-case.ts
  workspaces/list-workspace-city-coverage.use-case.ts
  workspaces/add-workspace-city-coverage.use-case.ts
  workspaces/remove-workspace-city-coverage.use-case.ts
  workspaces/deactivate-workspace.use-case.ts

Routes (7 new files + 3 modified)
  NEW: app/api/auth/forgot-password/route.ts
  NEW: app/api/auth/reset-password/route.ts
  NEW: app/api/auth/verify-email/route.ts
  NEW: app/api/auth/resend-verification/route.ts
  NEW: app/api/me/password/route.ts
  NEW: app/api/workspaces/[id]/city-coverage/route.ts
  NEW: app/api/workspaces/[id]/city-coverage/[coverageId]/route.ts
  MOD: app/api/me/route.ts  (+PATCH handler)
  MOD: app/api/workspaces/[id]/members/[memberId]/route.ts  (+PATCH handler)
  MOD: app/api/workspaces/[id]/route.ts  (+DELETE handler)
```

---

## Sub-Step Details

### Sub-step 0.1 — Password Reset

**Files**:
- `lib/auth.ts` — add `generateToken()`
- `server/repositories/user.repository.ts` — add `findByResetToken`, `setResetToken`, `clearResetToken`
- `server/schemas/auth.schema.ts` — add `ForgotPasswordSchema`, `ResetPasswordSchema`
- `server/use-cases/auth/forgot-password.use-case.ts` (NEW)
- `server/use-cases/auth/reset-password.use-case.ts` (NEW)
- `server/use-cases/index.ts` — export both
- `app/api/auth/forgot-password/route.ts` (NEW)
- `app/api/auth/reset-password/route.ts` (NEW)

**Key contracts**:

`forgot-password`:
- Input: `{ email }`
- Always returns `{ success: true }` (no email enumeration)
- If user found: `setResetToken(userId, hashed, expiresAt = now + 1h)` + (stub) send email with raw token
- Result code: none (always success)

`reset-password`:
- Input: `{ token, newPassword }`
- Hash incoming token → `findByResetToken(hashed)`
- If not found or expired → `{ success: false, code: 'INVALID_OR_EXPIRED_TOKEN' }`
- Hash new password → `updatePassword` + `clearResetToken`
- Result: `{ success: true }`

**Route methods**: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`

---

### Sub-step 0.2 — Email Verification

**Files**:
- `lib/auth.ts` — add `signEmailVerifyToken()`, `verifyEmailVerifyToken()`
- `server/repositories/user.repository.ts` — add `setEmailVerified`
- `server/schemas/auth.schema.ts` — add `VerifyEmailSchema`
- `server/use-cases/auth/verify-email.use-case.ts` (NEW)
- `server/use-cases/auth/resend-verification.use-case.ts` (NEW)
- `server/use-cases/index.ts` — export both
- `app/api/auth/verify-email/route.ts` (NEW)
- `app/api/auth/resend-verification/route.ts` (NEW)

**Key contracts**:

`verify-email`:
- Input: `{ token }`
- `verifyEmailVerifyToken(token)` → userId or null
- If null → `{ success: false, code: 'INVALID_OR_EXPIRED_TOKEN' }`
- Find user → if already verified → `{ success: false, code: 'ALREADY_VERIFIED' }`
- `setEmailVerified(userId)` → `{ success: true }`

`resend-verification`:
- Requires auth (`getPrincipal`)
- If already verified → `{ success: false, code: 'ALREADY_VERIFIED' }`
- `signEmailVerifyToken(userId)` + (stub) send email
- Always returns `{ success: true }`

**Route methods**: `POST /api/auth/verify-email`, `POST /api/auth/resend-verification`

---

### Sub-step 0.3 — User Profile Update

**Files**:
- `server/repositories/user.repository.ts` — add `updateProfile`, `updatePassword`
- `server/schemas/me.schema.ts` (NEW) — `UpdateMeSchema`, `ChangePasswordSchema`
- `server/use-cases/me/update-me.use-case.ts` (NEW)
- `server/use-cases/me/change-password.use-case.ts` (NEW)
- `server/use-cases/index.ts` — export both
- `app/api/me/route.ts` — add PATCH handler
- `app/api/me/password/route.ts` (NEW)

**Key contracts**:

`update-me`:
- Input: `{ principal, fullName?, phone? }`
- `updateProfile(userId, { fullName, phone })`
- Result: `{ success: true; data: { fullName, phone } }`

`change-password`:
- Input: `{ principal, currentPassword, newPassword }`
- `findByEmailForLogin` to get passwordHash → `verifyPassword`
- If mismatch → `{ success: false, code: 'WRONG_PASSWORD' }`
- `hashPassword(newPassword)` → `updatePassword(userId, hash)`
- Result: `{ success: true }`

**Schemas**:
```typescript
UpdateMeSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(8).optional(),
})
ChangePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
})
```

**Route methods**: `PATCH /api/me`, `PATCH /api/me/password`

---

### Sub-step 0.4 — Workspace Member Role Update

**Files**:
- `server/repositories/workspace.repository.ts` — add `updateMemberRole`
- `server/schemas/workspace.schema.ts` — add `UpdateMemberRoleSchema`
- `server/use-cases/workspaces/update-workspace-member-role.use-case.ts` (NEW)
- `server/use-cases/index.ts` — export
- `app/api/workspaces/[id]/members/[memberId]/route.ts` — add PATCH handler

**Key contracts**:

`update-workspace-member-role`:
- Input: `{ principal, workspaceId, memberId, role }`
- Only OWNER can update member roles
- Cannot update own role (self-update blocked)
- If not member → `NOT_FOUND`
- Codes: `FORBIDDEN`, `CANNOT_UPDATE_OWN_ROLE`, `NOT_FOUND`

**Schema**:
```typescript
UpdateMemberRoleSchema = z.object({
  role: z.enum(['OWNER', 'EDITOR', 'FINANCIAL'])
})
```

**Route method**: `PATCH /api/workspaces/:id/members/:memberId`

---

### Sub-step 0.5 — City Coverage CRUD

**Files**:
- `server/repositories/workspace.repository.ts` — add `listCityCoverage`, `addCityCoverage`, `removeCityCoverage`
- `server/schemas/workspace.schema.ts` — add `AddCityCoverageSchema`
- `server/use-cases/workspaces/list-workspace-city-coverage.use-case.ts` (NEW)
- `server/use-cases/workspaces/add-workspace-city-coverage.use-case.ts` (NEW)
- `server/use-cases/workspaces/remove-workspace-city-coverage.use-case.ts` (NEW)
- `server/use-cases/index.ts` — export all three
- `app/api/workspaces/[id]/city-coverage/route.ts` (NEW — GET + POST)
- `app/api/workspaces/[id]/city-coverage/[coverageId]/route.ts` (NEW — DELETE)

**Key contracts**:

`list-workspace-city-coverage`:
- OWNER or EDITOR can list
- Returns `Array<{ id, cityPlaceId, cityPlace: { name, slug } }>`

`add-workspace-city-coverage`:
- Input: `{ principal, workspaceId, cityPlaceId }`
- Only OWNER can add
- P2002 Prisma error → `{ success: false, code: 'ALREADY_EXISTS' }` (409)
- Returns `{ success: true; data: { id, cityPlaceId } }`

`remove-workspace-city-coverage`:
- Input: `{ principal, workspaceId, coverageId }`
- Only OWNER can remove
- If not found → `NOT_FOUND`

**Schema**:
```typescript
AddCityCoverageSchema = z.object({
  cityPlaceId: z.uuid()
})
```

**Route methods**: `GET /api/workspaces/:id/city-coverage`, `POST /api/workspaces/:id/city-coverage`, `DELETE /api/workspaces/:id/city-coverage/:coverageId`

---

### Sub-step 0.6 — Workspace Deactivation

**Files**:
- `server/repositories/workspace.repository.ts` — add `deactivate`
- `server/repositories/adoption.repository.ts` — add `hasActivePendingFollowUps`
- `server/use-cases/workspaces/deactivate-workspace.use-case.ts` (NEW)
- `server/use-cases/index.ts` — export
- `app/api/workspaces/[id]/route.ts` — add DELETE handler

**Key contracts**:

`deactivate-workspace`:
- Input: `{ principal, workspaceId }`
- Only OWNER can deactivate
- `adoptionRepo.hasActivePendingFollowUps(workspaceId)` → if true → `{ success: false, code: 'HAS_ACTIVE_ADOPTIONS' }` (409)
- `workspaceRepo.deactivate(workspaceId)` → sets `isActive = false`
- Result: `{ success: true }`

**Route method**: `DELETE /api/workspaces/:id`

---

## Error Code → HTTP Status Map

| Code | Status |
|------|--------|
| `INVALID_OR_EXPIRED_TOKEN` | 400 |
| `ALREADY_VERIFIED` | 409 |
| `WRONG_PASSWORD` | 400 |
| `CANNOT_UPDATE_OWN_ROLE` | 400 |
| `ALREADY_EXISTS` | 409 |
| `HAS_ACTIVE_ADOPTIONS` | 409 |
| `NOT_FOUND` | 404 |
| `FORBIDDEN` | 403 |
| `UNAUTHENTICATED` | 401 |

---

## Execution Order

Sub-steps are independent (no interdependencies), but this order minimizes context switching:

1. `lib/auth.ts` utilities — needed by 0.1 and 0.2
2. Repository layer — user (0.1+0.2+0.3), workspace (0.4+0.5+0.6), adoption (0.6)
3. Schemas — auth, me, workspace additions
4. Use cases — per sub-step
5. Routes — per sub-step
6. `use-cases/index.ts` — export all new use cases

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Email not actually sent (no email service) | Stub: log token to console in dev |
| `verifyEmailVerifyToken` JWT decode fails silently | Return null on any catch |
| P2002 from addCityCoverage not caught | Wrap in try/catch, check `error.code === 'P2002'` |
| Workspace deactivation blocks valid edge case | Test with adoption that has all follow-ups SUBMITTED/APPROVED |

---

## Out of Scope

- Actual email sending (stub only)
- `emailVerified` enforcement on login (separate task)
- Workspace re-activation
- Cascading pet deactivation on workspace deactivation
