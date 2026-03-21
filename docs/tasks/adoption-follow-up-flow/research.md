# Research: Adoption Follow-up Flow

**Date**: 2026-03-21
**Phase**: RESEARCH
**Status**: Complete

---

## Recommended Approach

Same established pattern: thin routes → use cases → repository. One new repository (or extend adoption.repository.ts — decision below), 6 use cases, 6 routes.

---

## Key Decisions

### 1. Repository: extend vs new file

**Options:**
- A) Add follow-up methods to `adoption.repository.ts`
- B) Create `follow-up.repository.ts`

**Decision: B — separate `follow-up.repository.ts`**

Rationale: adoption.repository.ts is already large and focused on the `Adoption` entity. Follow-ups and submissions are a distinct concern. Consistent with how pet images weren't bundled into pet.repository.ts... actually they were. But follow-up submissions are operationally different (admin list, approval workflow). A separate file is cleaner and prevents the adoption repo from growing unboundedly.

---

### 2. Resubmission after rejection

**Decision: YES — guardian can resubmit if previous submission is REJECTED.**

Rationale: The `currentSubmissionId` field on `AdoptionFollowUp` points to the latest submission. The `submissions` array holds all history. Allowing resubmission is the responsible platform behavior — if admin rejects with a `reviewNote`, the guardian should be able to try again. The follow-up status returns to `PENDING` when a resubmission is created, and `currentSubmissionId` is updated to the new submission.

---

### 3. Scheduling gate

**Decision: enforce `scheduledAt <= now` in the use case, not the DB.**

The DB only stores `scheduledAt`. The use case checks `followUp.scheduledAt <= new Date()` before allowing submission. Return code: `NOT_YET_DUE` → 422.

---

### 4. GET /me/adoptions — scope

Only adoptions where `guardianUserId === principal.userId`. Paginated. Include pet summary + follow-up statuses (same shape as `findByIdWithDetails` but as a list). Separate repository method.

---

### 5. Admin list filters

`GET /api/admin/follow-up-submissions`:
- Filter: `status` (SUBMITTED | APPROVED | REJECTED), `workspaceId` (the adoption's workspace)
- Pagination: `page`, `perPage` (max 50)
- RBAC: ADMIN or SUPER_ADMIN only

---

### 6. Photo fields

Schema has `photoUrl`, `storagePath`, `mimeType`, `fileSize` as non-nullable. All four required in `SubmitFollowUpSchema`. Consistent with pet images pattern (URL-based stubs).

---

## Edge Cases

| Case | Handling |
|---|---|
| Follow-up not found | `NOT_FOUND` → 404 |
| Follow-up already APPROVED | `ALREADY_APPROVED` → 409 (cannot resubmit approved follow-up) |
| Follow-up not yet due | `NOT_YET_DUE` → 422 |
| Submission not found (admin approve/reject) | `NOT_FOUND` → 404 |
| Submission already reviewed | `ALREADY_REVIEWED` → 409 |
| Guardian submits for adoption they don't own | `FORBIDDEN` → 403 |
| Admin approves already-rejected submission | `ALREADY_REVIEWED` → 409 |

---

## New Error Code → HTTP Map

| Code | Status |
|---|---|
| `NOT_FOUND` | 404 |
| `FORBIDDEN` | 403 |
| `UNAUTHENTICATED` | 401 |
| `NOT_YET_DUE` | 422 |
| `ALREADY_APPROVED` | 409 |
| `ALREADY_REVIEWED` | 409 |

---

## File Plan

```
New files:
  server/repositories/follow-up.repository.ts
  server/schemas/follow-up.schema.ts
  server/use-cases/follow-ups/list-adoption-follow-ups.use-case.ts
  server/use-cases/follow-ups/submit-follow-up.use-case.ts
  server/use-cases/follow-ups/list-follow-up-submissions-admin.use-case.ts
  server/use-cases/follow-ups/approve-follow-up-submission.use-case.ts
  server/use-cases/follow-ups/reject-follow-up-submission.use-case.ts
  server/use-cases/follow-ups/list-guardian-adoptions.use-case.ts
  app/api/adoptions/[id]/follow-ups/route.ts                    (GET)
  app/api/follow-ups/[id]/submissions/route.ts                  (POST)
  app/api/admin/follow-up-submissions/route.ts                  (GET)
  app/api/admin/follow-up-submissions/[id]/approve/route.ts     (POST)
  app/api/admin/follow-up-submissions/[id]/reject/route.ts      (POST)
  app/api/me/adoptions/route.ts                                 (GET)
  lib/swagger/definitions/follow-ups.ts

Modified files:
  server/repositories/index.ts         — export followUpRepository
  server/use-cases/index.ts            — export all 6 new use cases
```
