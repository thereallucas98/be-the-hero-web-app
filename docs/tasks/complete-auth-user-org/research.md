# Research: Complete Auth & User/Org

**Date**: 2026-03-11
**Phase**: RESEARCH
**Status**: COMPLETE

---

## Open Question 1 — Reset Token Storage

**Question**: Store raw or hashed token in DB?

**Decision**: Store `sha256(rawToken)` in DB. Send `rawToken` to the client (email link).

**Rationale**: If the DB is compromised, an attacker cannot use the stored token. Same principle as password hashing. Industry standard for password-reset tokens.

**Implementation**:
```typescript
// lib/auth.ts — new utility
import { createHash, randomBytes } from 'crypto'

export function generateToken(): { raw: string; hashed: string } {
  const raw = randomBytes(32).toString('hex')   // 64-char hex, sent in email
  const hashed = createHash('sha256').update(raw).digest('hex')
  return { raw, hashed }
}
```

`UserRepository.setResetToken(userId, hashedToken, expiresAt)` stores `hashed`.
`UserRepository.findByResetToken(hashedToken)` queries by `hashed`.

---

## Open Question 2 — Email Verification Token

**Question**: Schema only has `resetToken` / `resetTokenExpires` — how to store the email verification token?

**Decision**: Use a **signed JWT** for email verification — no new DB column needed.

**Rationale**:
- The schema already has `emailVerified: Boolean`. We only need to verify authenticity and freshness.
- A JWT signed with `JWT_SECRET` with `{ sub: userId, purpose: 'email_verify' }` (24h expiry) is self-contained — no DB lookup for the token itself.
- Avoids a new migration for `emailVerifyToken` / `emailVerifyTokenExpires` columns.
- On resend: the previous token automatically expires (JWT is stateless); no need to clear anything.

**Implementation**:
```typescript
// lib/auth.ts — new utility
export function signEmailVerifyToken(userId: string): string {
  return jwt.sign({ sub: userId, purpose: 'email_verify' }, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyEmailVerifyToken(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; purpose: string }
    if (payload.purpose !== 'email_verify') return null
    return { userId: payload.sub }
  } catch {
    return null
  }
}
```

The `verify-email` use case:
1. Calls `verifyEmailVerifyToken(token)` → gets `userId`
2. Checks user exists and `emailVerified === false`
3. Calls `userRepo.setEmailVerified(userId)`

---

## Open Question 3 — Workspace Deactivation Cascade

**Question**: When workspace is deactivated, should pets be deactivated too?

**Decision**: **No cascade to pets.** Only set `PartnerWorkspace.isActive = false`.

**Rationale**:
- Pets belong to a workspace but may still be referenced (adoptions, interests).
- Soft-deleting pets on workspace deactivation would be a destructive cascade hard to reverse.
- The safety check (AC11) already blocks deactivation if active adoptions with pending follow-ups exist.
- If needed in the future, a separate "archive workspace pets" operation can be built.

**Safety check query** (`adoptionRepository.hasActivePendingFollowUps(workspaceId)`):
```typescript
// Returns true if workspace has at least one:
//   Adoption { status: ACTIVE } WITH a follow-up { status: PENDING }
const count = await prisma.adoption.count({
  where: {
    workspaceId,
    status: 'ACTIVE',
    followUps: { some: { status: 'PENDING' } }
  }
})
return count > 0
```

---

## Open Question 4 — `adminCities` in Principal for Workspace Use Cases

**Question**: Do 0.4 / 0.5 / 0.6 workspace use cases need `adminCities` on `Principal`?

**Decision**: **No.** Use the same local `Principal` interface as other workspace use cases.

**Rationale**: `adminCities` is only used in geo-scoped admin queries (future phases). For workspace CRUD, RBAC is purely `{ userId, role, memberships }`. The `add-workspace-member.use-case.ts` already confirms this pattern.

---

## Decision Log

| # | Decision | Choice |
|---|----------|--------|
| 1 | Reset token storage | `sha256(raw)` in DB, raw in email |
| 2 | Email verify token | Signed JWT (24h), no DB column |
| 3 | Workspace deactivation cascade | Workspace flag only, no pet cascade |
| 4 | Principal for workspace use cases | `{ userId, role, memberships }` only |

---

## Confirmed: `lib/auth.ts` Changes

Add 3 new exports:
```
generateToken()              → { raw, hashed }
signEmailVerifyToken(userId) → string (JWT)
verifyEmailVerifyToken(token) → { userId } | null
```

No Prisma schema migration required. All open questions resolved.
