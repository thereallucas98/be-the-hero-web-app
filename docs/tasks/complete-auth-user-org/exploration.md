# Complete Auth & User/Org — EXPLORATION

**Date**: 2026-03-11
**Phase**: EXPLORATION
**Status**: COMPLETE

---

## Current Architecture

### 1. `lib/auth.ts`

Three functions only:
- `hashPassword(password)` — bcrypt, 12 rounds
- `verifyPassword(password, hash)` — bcrypt compare
- `signAccessToken({ sub, role })` — JWT, 7d expiry

**Missing**: no token generation utility (needed for reset/verification tokens).

---

### 2. `server/repositories/user.repository.ts`

**Interface has 5 methods:**

| Method | Purpose |
|--------|---------|
| `findByEmail(email)` | Check email existence (returns `{ id }`) |
| `findByEmailForLogin(email)` | Login — returns id, email, fullName, role, isActive, passwordHash |
| `findByIdForMe(id)` | Full user context for `GET /me` |
| `findByIdWithRole(id)` | RBAC check (returns id, role) |
| `create(data)` | Register new user |

**Missing methods needed:**
- `findByResetToken(hashedToken)` → for reset-password
- `setResetToken(userId, hashedToken, expiresAt)` → for forgot-password
- `clearResetToken(userId)` → after successful reset
- `setEmailVerified(userId)` → for verify-email
- `updateProfile(userId, { fullName?, phone? })` → for PATCH /me
- `updatePassword(userId, passwordHash)` → for PATCH /me/password

---

### 3. `server/repositories/workspace.repository.ts`

**Interface has 9 methods.** Missing:

| Method needed | Purpose |
|---------------|---------|
| `updateMemberRole(workspaceId, memberId, role)` | 0.4 — role update |
| `listCityCoverage(workspaceId)` | 0.5 — list coverage |
| `addCityCoverage(workspaceId, cityPlaceId)` | 0.5 — add city |
| `removeCityCoverage(workspaceId, coverageId)` | 0.5 — remove city |
| `deactivate(workspaceId)` | 0.6 — soft delete |

**Key observation**: `deactivateMember` already exists and follows the soft-delete pattern (`isActive = false`). `deactivate` for workspace should follow the same pattern.

**Key observation**: `PartnerCityCoverage` has `@@unique([workspaceId, cityPlaceId])` — Prisma will throw P2002 on duplicate, same pattern as `ALREADY_MEMBER`.

---

### 4. `server/schemas/auth.schema.ts`

Only `RegisterSchema` and `LoginSchema`. Need to add:
- `ForgotPasswordSchema` — `{ email: z.email() }`
- `ResetPasswordSchema` — `{ token: z.string(), newPassword: z.string().min(8) }`
- `VerifyEmailSchema` — `{ token: z.string() }`

---

### 5. Auth Use Cases Pattern (from `login-user.use-case.ts`, `register-user.use-case.ts`)

```
export interface [Name]Input { ... }
export type [Name]Result = { success: true; ... } | { success: false; code: '...' }
export async function [name](repo, input): Promise<[Name]Result> { ... }
```

No `Principal` needed for auth use cases (they're either public or identify by token string).

---

### 6. Workspace Use Cases Pattern (from `add-workspace-member.use-case.ts`)

```
export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

function isOwner(principal, workspaceId): boolean {
  return principal.memberships.find(m => m.workspaceId === workspaceId)?.role === 'OWNER'
}
```

**Note**: `adminCities` is not on this `Principal` type. The workspace use cases only use `userId`, `role`, and `memberships`. The same pattern will apply to 0.4, 0.5, 0.6.

---

### 7. `server/use-cases/index.ts`

All use cases are individually exported with their types. New use cases must be added here following the same pattern.

---

### 8. Route Pattern

From `workspaces/[id]/members/[memberId]/route.ts` (DELETE):
1. `getPrincipal(req)`
2. Validate path params with `z.uuid().safeParse()`
3. Call use case
4. Map result codes to status + message with `statusMap`/`messageMap`

PATCH on the same file will follow the same structure, adding body parsing.

---

### 9. Prisma Schema Fields Confirmed

```
User {
  resetToken        String?
  resetTokenExpires DateTime?
  emailVerified     Boolean @default(false)
  phone             String?
  fullName          String
  passwordHash      String
}

PartnerCityCoverage {
  id          String
  workspaceId String
  cityPlaceId String
  @@unique([workspaceId, cityPlaceId])
}

PartnerWorkspace {
  isActive Boolean @default(true)
}
```

---

### 10. Adoption safety check (for workspace deactivation)

For AC11, the `deactivateWorkspace` use case must check:
```sql
Adoption WHERE workspaceId = id AND status = 'ACTIVE'
  AND has at least one AdoptionFollowUp WHERE status = 'PENDING'
```

This requires either a new `adoptionRepository` method or a direct Prisma call in the use case. Given the pattern (repos passed as params), a new method `hasActivePendingFollowUps(workspaceId)` in `adoptionRepository` is the clean approach.

---

## Files to Modify (confirmed)

| File | Change |
|------|--------|
| `server/repositories/user.repository.ts` | +6 methods |
| `server/repositories/workspace.repository.ts` | +5 methods |
| `server/repositories/adoption.repository.ts` | +1 method (`hasActivePendingFollowUps`) |
| `server/schemas/auth.schema.ts` | +3 schemas |
| `server/schemas/workspace.schema.ts` | +2 schemas (UpdateMemberRole, AddCityCoverage) |
| `server/schemas/me.schema.ts` | NEW — UpdateMe, ChangePassword |
| `server/use-cases/index.ts` | +11 exports |
| `app/api/me/route.ts` | +PATCH handler |
| `app/api/workspaces/[id]/members/[memberId]/route.ts` | +PATCH handler |
| `app/api/workspaces/[id]/route.ts` | +DELETE handler |

## New Files

| File | Purpose |
|------|---------|
| `server/use-cases/auth/forgot-password.use-case.ts` | 0.1 |
| `server/use-cases/auth/reset-password.use-case.ts` | 0.1 |
| `server/use-cases/auth/verify-email.use-case.ts` | 0.2 |
| `server/use-cases/auth/resend-verification.use-case.ts` | 0.2 |
| `server/use-cases/me/update-me.use-case.ts` | 0.3 |
| `server/use-cases/me/change-password.use-case.ts` | 0.3 |
| `server/use-cases/workspaces/update-workspace-member-role.use-case.ts` | 0.4 |
| `server/use-cases/workspaces/list-workspace-city-coverage.use-case.ts` | 0.5 |
| `server/use-cases/workspaces/add-workspace-city-coverage.use-case.ts` | 0.5 |
| `server/use-cases/workspaces/remove-workspace-city-coverage.use-case.ts` | 0.5 |
| `server/use-cases/workspaces/deactivate-workspace.use-case.ts` | 0.6 |
| `app/api/auth/forgot-password/route.ts` | 0.1 |
| `app/api/auth/reset-password/route.ts` | 0.1 |
| `app/api/auth/verify-email/route.ts` | 0.2 |
| `app/api/auth/resend-verification/route.ts` | 0.2 |
| `app/api/me/password/route.ts` | 0.3 |
| `app/api/workspaces/[id]/city-coverage/route.ts` | 0.5 |
| `app/api/workspaces/[id]/city-coverage/[coverageId]/route.ts` | 0.5 |

---

## Open Questions for Research

1. **Reset token storage**: store raw or hashed? Security best practice is `sha256(token)` in DB, send raw to client. Confirm approach.
2. **Email verification token**: same field as reset token or separate? Schema has only `resetToken` — need a separate mechanism for email verification (could store in a separate field or reuse same columns with a type prefix).
3. **Workspace deactivation cascade**: should pets be deactivated too? Or just the workspace flag?
4. **`adminCities` in Principal**: workspace use cases don't use it — confirm this is intentional for 0.4/0.5/0.6.

---

## Blockers

✅ No blockers
