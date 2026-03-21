# Plan: Adoption Follow-up Flow

**Date**: 2026-03-21
**Phase**: PLANNING
**Status**: Pending Approval

---

## Objective

Complete the adoption follow-up workflow:
- **3.1** List follow-ups for an adoption (`GET /api/adoptions/:id/follow-ups`)
- **3.2** Guardian submits a follow-up (`POST /api/follow-ups/:id/submissions`)
- **3.3** Admin lists pending submissions (`GET /api/admin/follow-up-submissions`)
- **3.4** Admin approves a submission (`POST /api/admin/follow-up-submissions/:id/approve`)
- **3.5** Admin rejects a submission (`POST /api/admin/follow-up-submissions/:id/reject`)
- **3.6** Guardian lists their own adoptions (`GET /api/me/adoptions`)

---

## Architecture Overview

```
FollowUpRepository (new file)
  + findByAdoptionId(adoptionId)
  + findByIdWithAdoption(followUpId)
  + createSubmission(followUpId, submittedByUserId, data)
  + findSubmissionById(submissionId)
  + approveSubmission(submissionId, reviewerUserId)
  + rejectSubmission(submissionId, reviewerUserId, reviewNote)
  + listSubmissionsAdmin(opts)
  + findAdoptionsByGuardian(guardianUserId, opts)

Schemas (new file: server/schemas/follow-up.schema.ts)
  + SubmitFollowUpSchema
  + ReviewSubmissionSchema
  + ListFollowUpSubmissionsQuerySchema
  + ListGuardianAdoptionsQuerySchema

Use Cases (6 new files under server/use-cases/follow-ups/)
  + list-adoption-follow-ups.use-case.ts
  + submit-follow-up.use-case.ts
  + list-follow-up-submissions-admin.use-case.ts
  + approve-follow-up-submission.use-case.ts
  + reject-follow-up-submission.use-case.ts
  + list-guardian-adoptions.use-case.ts

Routes (6 new files)
  + app/api/adoptions/[id]/follow-ups/route.ts          (GET)
  + app/api/follow-ups/[id]/submissions/route.ts        (POST)
  + app/api/admin/follow-up-submissions/route.ts        (GET)
  + app/api/admin/follow-up-submissions/[id]/approve/route.ts (POST)
  + app/api/admin/follow-up-submissions/[id]/reject/route.ts  (POST)
  + app/api/me/adoptions/route.ts                       (GET)

Modified
  + server/repositories/index.ts   — export followUpRepository
  + server/use-cases/index.ts      — export all 6 use cases
  + lib/swagger/definitions/follow-ups.ts (new)
```

---

## Sub-step Details

### Sub-step 3.1 — List Follow-ups for Adoption

**Files:**
- `follow-up.repository.ts` — `findByAdoptionId`, `findByIdWithAdoption`
- `schemas/follow-up.schema.ts` — new file (start here, add all schemas)
- `use-cases/follow-ups/list-adoption-follow-ups.use-case.ts`
- `app/api/adoptions/[id]/follow-ups/route.ts` — GET

**Repository — `findByAdoptionId(adoptionId)`:**
- Select: id, type, scheduledAt, status, currentSubmission (id, status, submittedAt, photoUrl, message, reviewNote)
- Order: scheduledAt asc
- Returns: `FollowUpListItem[]`

**Use case — `list-adoption-follow-ups`:**
- Input: `{ principal, adoptionId }`
- `adoptionRepo.findByIdForAccess(adoptionId)` — 404 if not found
- RBAC: guardian of adoption OR workspace OWNER/EDITOR OR ADMIN/SUPER_ADMIN with city coverage
- Result: `{ success: true; followUps: FollowUpListItem[] }`

**Response shape:**
```json
[
  {
    "id": "uuid",
    "type": "DAYS_30",
    "scheduledAt": "ISO-8601",
    "status": "PENDING",
    "currentSubmission": null
  },
  {
    "id": "uuid",
    "type": "MONTHS_6",
    "scheduledAt": "ISO-8601",
    "status": "SUBMITTED",
    "currentSubmission": {
      "id": "uuid",
      "status": "SUBMITTED",
      "submittedAt": "ISO-8601",
      "photoUrl": "string",
      "message": "string | null",
      "reviewNote": "string | null"
    }
  }
]
```

---

### Sub-step 3.2 — Guardian Submits Follow-up

**Files:**
- `follow-up.repository.ts` — `createSubmission`
- `use-cases/follow-ups/submit-follow-up.use-case.ts`
- `app/api/follow-ups/[id]/submissions/route.ts` — POST

**Repository — `createSubmission(followUpId, submittedByUserId, data)`:**
- Transaction:
  1. `petRequirement.create` with submission data
  2. Update `AdoptionFollowUp.status = SUBMITTED`, `currentSubmissionId = newSubmission.id`
- Returns: created submission item

**Use case — `submit-follow-up`:**
- Input: `{ principal, followUpId, photoUrl, storagePath, mimeType, fileSize, message? }`
- `followUpRepo.findByIdWithAdoption(followUpId)` — 404 if not found
- RBAC: `principal.userId === adoption.guardianUserId` — else FORBIDDEN
- Guard: `followUp.status === 'APPROVED'` → `ALREADY_APPROVED`
- Guard: `followUp.scheduledAt > new Date()` → `NOT_YET_DUE`
- `followUpRepo.createSubmission(...)` — creates submission, updates follow-up status + currentSubmissionId
- Result: `{ success: true; submission }`

**Schema:**
```typescript
SubmitFollowUpSchema = z.object({
  photoUrl: z.string().url(),
  storagePath: z.string().min(1),
  mimeType: z.string().min(1),
  fileSize: z.number().int().positive(),
  message: z.string().max(1000).optional(),
}).strict()
```

---

### Sub-step 3.3 — Admin List Submissions

**Files:**
- `follow-up.repository.ts` — `listSubmissionsAdmin`
- `use-cases/follow-ups/list-follow-up-submissions-admin.use-case.ts`
- `app/api/admin/follow-up-submissions/route.ts` — GET

**Repository — `listSubmissionsAdmin(opts)`:**
- Filter: `status?`, `workspaceId?` (via adoption.workspaceId join)
- Paginated: page, perPage (max 50)
- Select: id, status, submittedAt, photoUrl, message, followUp (id, type, scheduledAt), adoption (id, workspaceId, pet: { name })
- Order: submittedAt desc
- Returns: `{ items, total, page, perPage }`

**Use case — `list-follow-up-submissions-admin`:**
- Input: `{ principal, status?, workspaceId?, page, perPage }`
- RBAC: `ADMIN` or `SUPER_ADMIN` — else FORBIDDEN
- Result: `{ success: true; items; total; page; perPage }`

**Schema:**
```typescript
ListFollowUpSubmissionsQuerySchema = z.object({
  status: z.enum(['SUBMITTED', 'APPROVED', 'REJECTED']).optional(),
  workspaceId: z.uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(20),
})
```

---

### Sub-step 3.4 — Admin Approve/Reject Submission

**Files:**
- `follow-up.repository.ts` — `findSubmissionById`, `approveSubmission`, `rejectSubmission`
- `use-cases/follow-ups/approve-follow-up-submission.use-case.ts`
- `use-cases/follow-ups/reject-follow-up-submission.use-case.ts`
- `app/api/admin/follow-up-submissions/[id]/approve/route.ts` — POST
- `app/api/admin/follow-up-submissions/[id]/reject/route.ts` — POST

**Repository — `approveSubmission(submissionId, reviewerUserId)`:**
- Transaction:
  1. Update submission: `status = APPROVED`, `reviewedAt = now`, `reviewedByUserId`
  2. Update parent follow-up: `status = APPROVED`
  3. Audit log: action = `APPROVE`, entityType = `FOLLOW_UP_SUBMISSION`
- Returns: updated submission

**Repository — `rejectSubmission(submissionId, reviewerUserId, reviewNote)`:**
- Transaction:
  1. Update submission: `status = REJECTED`, `reviewedAt = now`, `reviewedByUserId`, `reviewNote`
  2. Update parent follow-up: `status = REJECTED` (guardian can resubmit → back to PENDING on next submission)
  3. Audit log: action = `REJECT`
- Returns: updated submission

**Use cases (both):**
- Input: `{ principal, submissionId [, reviewNote] }`
- RBAC: ADMIN or SUPER_ADMIN
- `followUpRepo.findSubmissionById(submissionId)` — 404 if not found
- Guard: `submission.status !== 'SUBMITTED'` → `ALREADY_REVIEWED`
- Call repo approve/reject
- Result: `{ success: true; submission }`

**Schema:**
```typescript
ReviewSubmissionSchema = z.object({
  reviewNote: z.string().min(1).max(1000),
}).strict()
```

---

### Sub-step 3.5 — Guardian List Own Adoptions

**Files:**
- `follow-up.repository.ts` — `findAdoptionsByGuardian`
- `schemas/follow-up.schema.ts` — `ListGuardianAdoptionsQuerySchema`
- `use-cases/follow-ups/list-guardian-adoptions.use-case.ts`
- `app/api/me/adoptions/route.ts` — GET

**Repository — `findAdoptionsByGuardian(guardianUserId, opts)`:**
- Filter: `guardianUserId`
- Paginated: page, perPage (max 20)
- Select: id, adoptedAt, status, notes, pet (id, name, species, coverImage), followUps (id, type, status, scheduledAt, currentSubmission: { status })
- Order: adoptedAt desc
- Returns: `{ items, total, page, perPage }`

**Use case — `list-guardian-adoptions`:**
- Input: `{ principal, page, perPage }`
- RBAC: `principal` must exist (any authenticated user) + must be GUARDIAN role
- Returns: paginated adoptions list

**Schema:**
```typescript
ListGuardianAdoptionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(20).default(10),
})
```

---

## Error Code → HTTP Map

| Code | Status |
|---|---|
| `NOT_FOUND` | 404 |
| `FORBIDDEN` | 403 |
| `UNAUTHENTICATED` | 401 |
| `NOT_YET_DUE` | 422 |
| `ALREADY_APPROVED` | 409 |
| `ALREADY_REVIEWED` | 409 |

---

## Execution Order

1. `follow-up.repository.ts` — all 8 methods + interface types
2. `schemas/follow-up.schema.ts` — all 4 schemas
3. `server/repositories/index.ts` — export followUpRepository
4. Sub-step 3.1: use case + route → QA gate
5. Sub-step 3.2: use case + route → QA gate
6. Sub-step 3.3: use case + route → QA gate
7. Sub-step 3.4: use cases + routes (approve + reject together) → QA gate
8. Sub-step 3.5: use case + route → QA gate
9. `server/use-cases/index.ts` — export all 6 use cases
10. `lib/swagger/definitions/follow-ups.ts` — Swagger docs for all 6 endpoints
11. lint + build

---

## Out of Scope

- Photo upload to Supabase (URLs are stubs, same as pet images)
- Email notifications to guardian on review
- Bulk admin operations
