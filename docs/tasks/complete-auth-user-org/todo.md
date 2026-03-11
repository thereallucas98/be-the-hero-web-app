# TODO: Complete Auth & User/Org

**Date**: 2026-03-11
**Phase**: PLANNING
**Status**: Pending Approval

---

## Implementation Checklist

### Phase 1: Shared Utilities

- [ ] **1.1** `lib/auth.ts` — add `generateToken(): { raw, hashed }`
- [ ] **1.2** `lib/auth.ts` — add `signEmailVerifyToken(userId): string`
- [ ] **1.3** `lib/auth.ts` — add `verifyEmailVerifyToken(token): { userId } | null`

### Phase 2: Repository Layer

- [ ] **2.1** `user.repository.ts` — add `findByResetToken(hashedToken)`
- [ ] **2.2** `user.repository.ts` — add `setResetToken(userId, hashedToken, expiresAt)`
- [ ] **2.3** `user.repository.ts` — add `clearResetToken(userId)`
- [ ] **2.4** `user.repository.ts` — add `setEmailVerified(userId)`
- [ ] **2.5** `user.repository.ts` — add `updateProfile(userId, data)`
- [ ] **2.6** `user.repository.ts` — add `updatePassword(userId, passwordHash)`
- [ ] **2.7** `workspace.repository.ts` — add `updateMemberRole(workspaceId, memberId, role)`
- [ ] **2.8** `workspace.repository.ts` — add `listCityCoverage(workspaceId)`
- [ ] **2.9** `workspace.repository.ts` — add `addCityCoverage(workspaceId, cityPlaceId)`
- [ ] **2.10** `workspace.repository.ts` — add `removeCityCoverage(workspaceId, coverageId)`
- [ ] **2.11** `workspace.repository.ts` — add `deactivate(workspaceId)`
- [ ] **2.12** `adoption.repository.ts` — add `hasActivePendingFollowUps(workspaceId)`

### Phase 3: Schemas

- [ ] **3.1** `auth.schema.ts` — add `ForgotPasswordSchema`
- [ ] **3.2** `auth.schema.ts` — add `ResetPasswordSchema`
- [ ] **3.3** `auth.schema.ts` — add `VerifyEmailSchema`
- [ ] **3.4** `workspace.schema.ts` — add `UpdateMemberRoleSchema`
- [ ] **3.5** `workspace.schema.ts` — add `AddCityCoverageSchema`
- [ ] **3.6** `me.schema.ts` — NEW file with `UpdateMeSchema`, `ChangePasswordSchema`

### Phase 4: Use Cases — Sub-step 0.1 (Password Reset)

- [ ] **4.1** `auth/forgot-password.use-case.ts` — NEW
- [ ] **4.2** `auth/reset-password.use-case.ts` — NEW

### Phase 5: Routes — Sub-step 0.1

- [ ] **5.1** `app/api/auth/forgot-password/route.ts` — NEW (POST)
- [ ] **5.2** `app/api/auth/reset-password/route.ts` — NEW (POST)

> **QA gate 0.1** — test before continuing

### Phase 6: Use Cases — Sub-step 0.2 (Email Verification)

- [ ] **6.1** `auth/verify-email.use-case.ts` — NEW
- [ ] **6.2** `auth/resend-verification.use-case.ts` — NEW

### Phase 7: Routes — Sub-step 0.2

- [ ] **7.1** `app/api/auth/verify-email/route.ts` — NEW (POST)
- [ ] **7.2** `app/api/auth/resend-verification/route.ts` — NEW (POST)

> **QA gate 0.2** — test before continuing

### Phase 8: Use Cases — Sub-step 0.3 (User Profile)

- [ ] **8.1** `me/update-me.use-case.ts` — NEW
- [ ] **8.2** `me/change-password.use-case.ts` — NEW

### Phase 9: Routes — Sub-step 0.3

- [ ] **9.1** `app/api/me/route.ts` — add PATCH handler
- [ ] **9.2** `app/api/me/password/route.ts` — NEW (PATCH)

> **QA gate 0.3** — test before continuing

### Phase 10: Use Case — Sub-step 0.4 (Member Role)

- [ ] **10.1** `workspaces/update-workspace-member-role.use-case.ts` — NEW

### Phase 11: Route — Sub-step 0.4

- [ ] **11.1** `app/api/workspaces/[id]/members/[memberId]/route.ts` — add PATCH handler

> **QA gate 0.4** — test before continuing

### Phase 12: Use Cases — Sub-step 0.5 (City Coverage)

- [ ] **12.1** `workspaces/list-workspace-city-coverage.use-case.ts` — NEW
- [ ] **12.2** `workspaces/add-workspace-city-coverage.use-case.ts` — NEW
- [ ] **12.3** `workspaces/remove-workspace-city-coverage.use-case.ts` — NEW

### Phase 13: Routes — Sub-step 0.5

- [ ] **13.1** `app/api/workspaces/[id]/city-coverage/route.ts` — NEW (GET + POST)
- [ ] **13.2** `app/api/workspaces/[id]/city-coverage/[coverageId]/route.ts` — NEW (DELETE)

> **QA gate 0.5** — test before continuing

### Phase 14: Use Case — Sub-step 0.6 (Workspace Deactivation)

- [ ] **14.1** `workspaces/deactivate-workspace.use-case.ts` — NEW

### Phase 15: Route — Sub-step 0.6

- [ ] **15.1** `app/api/workspaces/[id]/route.ts` — add DELETE handler

> **QA gate 0.6** — test before continuing

### Phase 16: Wiring

- [ ] **16.1** `server/use-cases/index.ts` — export all 11 new use cases with types
- [ ] **16.2** Final TypeScript check (no errors)

---

## Progress Notes

| Step | Status | Notes |
|------|--------|-------|
| 1.1–1.3 | Pending | |
| 2.1–2.12 | Pending | |
| 3.1–3.6 | Pending | |
| 4.1–4.2 | Pending | |
| 5.1–5.2 | Pending | QA gate 0.1 |
| 6.1–6.2 | Pending | |
| 7.1–7.2 | Pending | QA gate 0.2 |
| 8.1–8.2 | Pending | |
| 9.1–9.2 | Pending | QA gate 0.3 |
| 10.1 | Pending | |
| 11.1 | Pending | QA gate 0.4 |
| 12.1–12.3 | Pending | |
| 13.1–13.2 | Pending | QA gate 0.5 |
| 14.1 | Pending | |
| 15.1 | Pending | QA gate 0.6 |
| 16.1–16.2 | Pending | |
