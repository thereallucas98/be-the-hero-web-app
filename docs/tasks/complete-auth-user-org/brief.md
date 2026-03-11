# Task Brief: Complete Auth & User/Org

**Created**: 2026-03-11
**Status**: Approved
**Complexity**: Medium
**Type**: API Endpoints
**Estimated Effort**: 6-9 hours

---

## Feature Overview

### User Story

As a registered user, I want to reset my password, verify my email, and update my profile so that I can manage my account securely.

As a workspace owner, I want to update member roles, manage city coverage, and deactivate my workspace so that I can fully control my organization.

### Problem Statement

The Prisma schema already has fields for password reset (`resetToken`, `resetTokenExpires`) and email verification (`emailVerified`), and the platform has partial workspace management — but there are no routes that expose these capabilities. Users cannot recover access if they forget their password, email verification is tracked but never enforced, workspace owners cannot change a member's role or manage which cities the workspace covers, and workspaces cannot be deactivated.

### Scope

**In Scope:**
- 0.1 Password reset flow (forgot + reset, 2 routes)
- 0.2 Email verification flow (verify + resend, 2 routes)
- 0.3 User profile self-management (update profile + change password, 2 routes)
- 0.4 Workspace member role update (1 route)
- 0.5 Workspace city coverage management (3 routes)
- 0.6 Workspace deactivation (1 route)

**Out of Scope:**
- Actual email sending (token is returned in response for now; email integration is a separate concern)
- Frontend UI
- Admin user management

---

## Current State

**Key Files:**
- `apps/web/src/app/api/auth/` — register, login, logout (no reset/verify)
- `apps/web/src/app/api/me/route.ts` — GET only (no PATCH)
- `apps/web/src/app/api/workspaces/[id]/members/route.ts` — POST (add), no PATCH
- `apps/web/src/app/api/workspaces/[id]/members/[memberId]/route.ts` — DELETE only
- `apps/web/src/server/repositories/user.repository.ts` — 5 methods; no reset token or update methods
- `apps/web/src/server/repositories/workspace.repository.ts` — no `updateMemberRole`, no city coverage, no deactivation
- `apps/web/src/server/schemas/auth.schema.ts` — only Register and Login schemas
- `apps/web/src/lib/auth.ts` — `hashPassword`, `verifyPassword`, `signAccessToken`

**Gaps/Issues:**
- `User.resetToken` and `User.resetTokenExpires` exist in DB but are never written
- `User.emailVerified` is returned by `GET /me` but is never set to `true`
- No method to update `User.fullName`, `User.phone`, or `User.passwordHash`
- `PartnerMember.role` can only be set at creation; no update route
- `PartnerCityCoverage` table has zero routes (exists in schema, auto-populated on workspace create/location update only)
- `PartnerWorkspace.isActive` can only be set to `false` by admin tools (not by the owner)

---

## Requirements

### Functional Requirements

**FR1: Password Reset**
- **Trigger**: User POSTs email to `/api/auth/forgot-password`
- **Expected**: Token generated, stored hashed in DB with 1h expiry; response always 200
- **Edge Cases**: Unknown email still returns 200 (no enumeration); expired token returns 400

**FR2: Email Verification**
- **Trigger**: User POSTs token to `/api/auth/verify-email`
- **Expected**: `emailVerified = true` set; token cleared; no-op if already verified
- **Edge Cases**: Invalid/expired token returns 400; resend is no-op if already verified

**FR3: Profile Update**
- **Trigger**: Authenticated user PATCHes `/api/me`
- **Expected**: `fullName` and/or `phone` updated
- **Edge Cases**: Empty body returns current user unchanged; no email change allowed here

**FR4: Password Change**
- **Trigger**: Authenticated user PATCHes `/api/me/password`
- **Expected**: `currentPassword` validated before updating; new token issued
- **Edge Cases**: Wrong current password → 401

**FR5: Member Role Update**
- **Trigger**: Workspace OWNER PATCHes member role
- **Expected**: Role updated; cannot demote last OWNER → 409
- **Edge Cases**: Target member must belong to workspace and be active

**FR6: City Coverage**
- **Trigger**: OWNER adds/removes cities; anyone in workspace can list
- **Expected**: Coverage list updated; duplicate city → 409
- **Edge Cases**: `cityPlaceId` must be a valid CITY-type GeoPlace

**FR7: Workspace Deactivation**
- **Trigger**: OWNER DELETEs workspace
- **Expected**: `isActive = false` set; all active pets cascade to inactive
- **Edge Cases**: Cannot deactivate if there are ACTIVE adoptions with PENDING follow-ups

---

## Technical Approach

**Chosen Approach:** Follow the established pattern — thin routes, use cases, repositories.

New repository methods added to existing `UserRepository` and `WorkspaceRepository`. New use cases in `server/use-cases/auth/`, `server/use-cases/me/`, and `server/use-cases/workspaces/`. New schemas in `server/schemas/`.

**Rationale:** Zero new patterns introduced; all new code follows existing conventions exactly.

---

## Files to Change

### New Files
- [ ] `server/use-cases/auth/forgot-password.use-case.ts`
- [ ] `server/use-cases/auth/reset-password.use-case.ts`
- [ ] `server/use-cases/auth/verify-email.use-case.ts`
- [ ] `server/use-cases/auth/resend-verification.use-case.ts`
- [ ] `server/use-cases/me/update-me.use-case.ts`
- [ ] `server/use-cases/me/change-password.use-case.ts`
- [ ] `server/use-cases/workspaces/update-workspace-member-role.use-case.ts`
- [ ] `server/use-cases/workspaces/list-workspace-city-coverage.use-case.ts`
- [ ] `server/use-cases/workspaces/add-workspace-city-coverage.use-case.ts`
- [ ] `server/use-cases/workspaces/remove-workspace-city-coverage.use-case.ts`
- [ ] `server/use-cases/workspaces/deactivate-workspace.use-case.ts`
- [ ] `app/api/auth/forgot-password/route.ts`
- [ ] `app/api/auth/reset-password/route.ts`
- [ ] `app/api/auth/verify-email/route.ts`
- [ ] `app/api/auth/resend-verification/route.ts`
- [ ] `app/api/me/password/route.ts`
- [ ] `app/api/workspaces/[id]/city-coverage/route.ts`
- [ ] `app/api/workspaces/[id]/city-coverage/[coverageId]/route.ts`

### Modified Files
- [ ] `server/repositories/user.repository.ts` — add 6 new methods
- [ ] `server/repositories/workspace.repository.ts` — add 5 new methods
- [ ] `server/schemas/auth.schema.ts` — add 4 new schemas
- [ ] `server/schemas/workspace.schema.ts` — add 2 new schemas
- [ ] `server/schemas/me.schema.ts` — create (update profile, change password)
- [ ] `app/api/me/route.ts` — add PATCH handler
- [ ] `app/api/workspaces/[id]/members/[memberId]/route.ts` — add PATCH handler
- [ ] `app/api/workspaces/[id]/route.ts` — add DELETE handler
- [ ] `server/use-cases/index.ts` — export all new use cases
- [ ] `server/repositories/index.ts` — no change needed (repos already instantiated)

---

## Acceptance Criteria

### Must Have (P0)
- [ ] **AC1**: `POST /api/auth/forgot-password` always returns 200; token stored in DB
- [ ] **AC2**: `POST /api/auth/reset-password` with valid token updates password and clears token
- [ ] **AC3**: `POST /api/auth/reset-password` with expired/used token returns 400
- [ ] **AC4**: `POST /api/auth/verify-email` sets `emailVerified = true`
- [ ] **AC5**: `PATCH /api/me` updates fullName/phone for authenticated user
- [ ] **AC6**: `PATCH /api/me/password` validates current password before updating
- [ ] **AC7**: `PATCH /api/workspaces/:id/members/:memberId` updates member role
- [ ] **AC8**: Cannot demote last OWNER → 409
- [ ] **AC9**: City coverage CRUD works; duplicate city → 409
- [ ] **AC10**: `DELETE /api/workspaces/:id` deactivates workspace (isActive = false)
- [ ] **AC11**: Cannot deactivate workspace with active adoptions + pending follow-ups → 409

### Should Have (P1)
- [ ] **AC12**: `POST /api/auth/resend-verification` is no-op if already verified
- [ ] **AC13**: All new routes follow existing error code → HTTP status mapping

---

## Test Strategy

**API endpoints** (for each route):
- Happy path with valid data
- Missing auth → 401
- Wrong role/ownership → 403
- Invalid body → 400 with details
- Business rule violation → 409

---

## Dependencies

**Blocks:** Phase 4 (Campaigns) — depends on 0.5 city coverage
**Blocked By:** None
**Related Work:** `PartnerCityCoverage` already auto-populated by workspace create and location update

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Reset token must be hashed (security) | Low | High | Store `sha256(token)` in DB; send raw token to client |
| Workspace deactivation cascade (pets, members) | Medium | Medium | Check adoptions first; only set `isActive=false` on workspace itself |
| `emailVerified` not enforced yet | Low | Low | Out of scope — enforcement is a separate task |

---

## Complexity Estimate

**Overall**: Medium
- Backend: Medium (11 new use cases, 11 new routes, ~11 new repo methods)
- Frontend: None

**Estimated Effort**: 6-9 hours
**Confidence**: High

---

## Approval

**Approved By**: @davidlucas
**Approval Date**: 2026-03-11

- [x] Requirements clear and complete
- [x] Technical approach sound
- [x] Acceptance criteria testable
- [x] Risks understood
