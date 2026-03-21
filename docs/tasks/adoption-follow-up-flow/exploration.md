# Exploration: Adoption Follow-up Flow

**Date**: 2026-03-21
**Phase**: EXPLORATION
**Status**: Complete

---

## Current Implementation Overview

The adoption lifecycle is partially implemented. Adoptions can be registered and follow-up records are auto-created, but there are no routes to read or act on them.

### What already works

- `POST /api/adoptions` — registers an adoption, auto-creates 3 `AdoptionFollowUp` records (DAYS_30, MONTHS_6, YEAR_1) at +30d, +6m, +1y from `adoptedAt`
- `GET /api/adoptions/:id` — returns adoption detail including a `followUps` summary array (id, type, status, scheduledAt, currentSubmission)
- RBAC permissions for `AdoptionFollowUp` and `AdoptionFollowUpSubmission` are already defined in `packages/auth/`
- Audit entity types `FOLLOW_UP` and `FOLLOW_UP_SUBMISSION` exist; actions `SUBMIT_FOR_REVIEW`, `APPROVE`, `REJECT` are available

### What is missing

All read/write routes for follow-ups, all use cases, all follow-up-specific repository methods.

---

## Key Files

### Schema
`apps/web/prisma/schema.prisma`

**`AdoptionFollowUp`**
- `id`, `adoptionId` (FK → Adoption, cascade delete)
- `type`: enum `AdoptionFollowUpType` — `DAYS_30 | MONTHS_6 | YEAR_1`
- `scheduledAt`: DateTime (due date computed at adoption creation)
- `status`: enum `AdoptionFollowUpStatus` — `PENDING | SUBMITTED | APPROVED | REJECTED`
- `currentSubmissionId`: optional FK → latest `AdoptionFollowUpSubmission`
- Unique constraint: `(adoptionId, type)` — one follow-up per type per adoption

**`AdoptionFollowUpSubmission`**
- `id`, `followUpId` (FK → AdoptionFollowUp, cascade delete)
- `submittedByUserId`: FK → User (guardian)
- `photoUrl`, `storagePath`, `mimeType`, `fileSize` — proof photo fields
- `message`: optional String
- `submittedAt`: DateTime (default now)
- `status`: enum `FollowUpSubmissionStatus` — `SUBMITTED | APPROVED | REJECTED`
- `reviewedAt`, `reviewedByUserId`, `reviewNote` — admin review fields

**Enums**
- `AdoptionFollowUpType`: DAYS_30, MONTHS_6, YEAR_1
- `AdoptionFollowUpStatus`: PENDING, SUBMITTED, APPROVED, REJECTED
- `FollowUpSubmissionStatus`: SUBMITTED, APPROVED, REJECTED

### Repositories
`apps/web/src/server/repositories/adoption.repository.ts`

Interface `AdoptionRepository` — 3 methods:
- `create(data)` — registers adoption + 3 follow-ups in transaction
- `findByIdForAccess(id)` — returns guardianUserId, workspaceId, workspaceCityIds
- `findByIdWithDetails(id)` — full adoption with follow-ups summary

**All follow-up-specific DB access is missing.**

### Use Cases
`apps/web/src/server/use-cases/adoptions/`
- `register-adoption.use-case.ts` — implemented
- `get-adoption-by-id.use-case.ts` — implemented; RBAC pattern uses guardianUserId, workspaceId, adminCityIds

**6 use cases missing** (see gaps below).

### Schemas
`apps/web/src/server/schemas/adoption.schema.ts`
- `RegisterAdoptionSchema` — only schema currently

**3 schemas missing** (submission, review, admin list query).

### RBAC (`packages/auth/`)
- `AdoptionFollowUp`: read → ADMIN, PARTNER_MEMBER
- `AdoptionFollowUpSubmission`: manage → ADMIN; create/update → GUARDIAN

### Audit
- Entity types: `FOLLOW_UP`, `FOLLOW_UP_SUBMISSION`
- Actions: `SUBMIT_FOR_REVIEW`, `APPROVE`, `REJECT`

---

## Integration Points

- `adoptionRepository` — needs new follow-up methods added; existing `findByIdForAccess` used for RBAC in use cases
- `auditRepository` — used for submission and review audit trail
- `workspaceRepository` — not directly needed (workspace context comes from adoption)
- Storage: submissions store `photoUrl` + `storagePath` (URL-based stubs; same pattern as pet images)

---

## Gaps

| Gap | Details |
|---|---|
| Repository methods | findFollowUpsByAdoptionId, findFollowUpById, createSubmission, findSubmissionById, approveSubmission, rejectSubmission, listSubmissionsAdmin, findAdoptionsByGuardian |
| Schemas | SubmitFollowUpSchema, ReviewSubmissionSchema, ListSubmissionsQuerySchema, ListGuardianAdoptionsQuerySchema |
| Use cases | list-adoption-follow-ups, submit-follow-up, list-follow-up-submissions-admin, approve-follow-up-submission, reject-follow-up-submission, list-guardian-adoptions |
| Routes | GET /adoptions/:id/follow-ups, POST /follow-ups/:id/submissions, GET /admin/follow-up-submissions, POST /admin/follow-up-submissions/:id/approve, POST /admin/follow-up-submissions/:id/reject, GET /me/adoptions |

---

## Open Questions / Risks

1. **Resubmission**: Can a guardian resubmit if previous submission was REJECTED? Roadmap is silent. Decision needed before planning.
2. **Photo fields are required** in the schema (`photoUrl`, `storagePath`, `mimeType`, `fileSize`) — all non-nullable. Need to enforce in schema validation.
3. **`scheduledAt <= now` enforcement**: Roadmap says follow-up must be "due" to submit. This check happens in the use case, not the DB.
4. **Admin list filter**: Roadmap mentions `workspaceId` filter — need to know if admin filters by the adoption's workspace.
