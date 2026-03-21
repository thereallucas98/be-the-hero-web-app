# Task Brief: Adoption Interest Pipeline

**Created**: 2026-03-21
**Status**: Draft
**Complexity**: Medium
**Type**: API Endpoint
**Estimated Effort**: 3–5 hours

---

## Feature Overview

### User Story

- As a **guardian**, I want to see the interests I've submitted, and withdraw one if I change my mind.
- As a **workspace member (OWNER/EDITOR)**, I want to convert a guardian's adoption interest into a formal adoption, or dismiss it if it's no longer relevant.

### Problem Statement

Guardians can already express interest in a pet (`POST /api/pets/:id/interests`) and workspace members can list incoming interests (`GET /api/workspaces/:id/interests`). However, there is no way to:
- Complete the pipeline by converting an interest to an adoption
- Remove interests (either by the guardian or the workspace)
- Let guardians see their own submitted interests

### Scope

**In Scope:**
- `GET /api/me/interests` — Guardian lists their own interests
- `DELETE /api/pets/:id/interests/:interestId` — Guardian withdraws an interest
- `POST /api/workspaces/:id/interests/:interestId/convert` — Workspace converts interest → Adoption (creates AdoptionFollowUps automatically)
- `DELETE /api/workspaces/:id/interests/:interestId` — Workspace dismisses an interest

**Out of Scope:**
- Email/push notifications to guardian on dismiss or convert
- Interest `status` field / state machine (interests stay ephemeral — deleted on any terminal action)
- Frontend UI

---

## Current State

**Key Files:**
- `apps/web/src/server/repositories/adoption-interest.repository.ts` — `create`, `listByWorkspace`
- `apps/web/src/server/use-cases/adoption-interests/register-adoption-interest.use-case.ts` — guardian registers interest
- `apps/web/src/server/use-cases/workspaces/list-workspace-interests.use-case.ts` — workspace lists interests
- `apps/web/src/app/api/pets/[id]/interests/route.ts` — POST handler
- `apps/web/src/app/api/workspaces/[id]/interests/route.ts` — GET handler
- `apps/web/src/server/use-cases/adoptions/register-adoption.use-case.ts` — existing adoption creation logic
- `apps/web/src/server/repositories/adoption.repository.ts` — `create` (creates adoption + follow-ups in transaction)

**Current Behavior:**
- Guardian can POST an interest; it is stored with petId, userId, workspaceId, message, channel.
- Workspace OWNER/EDITOR/ADMIN can list interests for their workspace (paginated).
- No terminal actions exist on interests (no delete, no convert).

**Gaps/Issues:**
- No way to complete the interest → adoption pipeline from the API.
- No way for guardian to withdraw or view own interests.
- `AdoptionInterestRepository` missing: `findById`, `findByUserId`, `deleteById`, `findByIdForWorkspace`.

---

## Requirements

### Functional Requirements

**FR1: Guardian lists own interests**
- **Description**: Authenticated guardian retrieves paginated list of their submitted interests.
- **Trigger**: `GET /api/me/interests?page=&perPage=`
- **Expected Outcome**: Returns `{ items, total, page, perPage }` with pet summary per interest.
- **Edge Cases**: Unauthenticated → 401.

**FR2: Guardian withdraws interest**
- **Description**: Guardian deletes one of their own interests.
- **Trigger**: `DELETE /api/pets/:id/interests/:interestId`
- **Expected Outcome**: 204 No Content; interest row deleted from DB.
- **Edge Cases**: Interest not found → 404; interest belongs to another user → 403; bad UUID → 400.

**FR3: Workspace converts interest to adoption**
- **Description**: OWNER/EDITOR of the workspace creates an adoption from the interest. Re-validates pet status. Deletes the interest on success.
- **Trigger**: `POST /api/workspaces/:id/interests/:interestId/convert` with optional `{ notes, adoptedAt }`.
- **Expected Outcome**: 201 with created adoption object; interest deleted; pet status updated to ADOPTED; follow-ups created.
- **Edge Cases**: Interest not found / wrong workspace → 404; pet already adopted → 409; pet not approved → 409; workspace inactive → 409; unauthenticated → 401; forbidden → 403.

**FR4: Workspace dismisses interest**
- **Description**: OWNER/EDITOR removes an interest without creating an adoption.
- **Trigger**: `DELETE /api/workspaces/:id/interests/:interestId`
- **Expected Outcome**: 204; interest row deleted.
- **Edge Cases**: Interest not found or wrong workspace → 404; forbidden → 403.

---

## Technical Approach

**Chosen Approach:**
- Extend `AdoptionInterestRepository` with 4 new methods.
- 4 new use cases under `adoption-interests/`.
- 4 new route handlers (2 on `me/interests`, 1 on `pets/[id]/interests/[interestId]`, 2 on `workspaces/[id]/interests/[interestId]`).
- Convert reuses `adoptionRepo.create()` directly (bypassing `registerAdoption` use case which requires different RBAC/input shape); re-validates pet with `petRepo.findByIdForAdoption`.
- Interests are deleted (not soft-deleted) on withdraw, dismiss, and convert.

**Alternatives Considered:**
1. **Reuse `registerAdoption` use case inside convert**: Rejected — it expects `guardianUserId` as explicit input and has workspace RBAC baked in differently. Simpler to call `petRepo` + `adoptionRepo` directly.
2. **Add `status` enum to AdoptionInterest**: Rejected — requires a DB migration and the interest lifecycle is simple enough to handle via deletion.

**Rationale:**
Deletion keeps the model clean, avoids migrations, and matches the ephemeral nature of an interest. The convert use case is a thin orchestrator that wires existing repos together.

---

## Files to Change

### New Files
- [ ] `apps/web/src/server/use-cases/adoption-interests/list-my-interests.use-case.ts`
- [ ] `apps/web/src/server/use-cases/adoption-interests/withdraw-adoption-interest.use-case.ts`
- [ ] `apps/web/src/server/use-cases/adoption-interests/convert-interest-to-adoption.use-case.ts`
- [ ] `apps/web/src/server/use-cases/adoption-interests/dismiss-adoption-interest.use-case.ts`
- [ ] `apps/web/src/app/api/me/interests/route.ts` — GET
- [ ] `apps/web/src/app/api/pets/[id]/interests/[interestId]/route.ts` — DELETE
- [ ] `apps/web/src/app/api/workspaces/[id]/interests/[interestId]/route.ts` — POST (convert) + DELETE (dismiss)

### Modified Files
- [ ] `apps/web/src/server/repositories/adoption-interest.repository.ts` — add `findById`, `findByUserId`, `deleteById`, `findByIdForWorkspace`
- [ ] `apps/web/src/server/schemas/` — add `ConvertInterestSchema`, `ListMyInterestsQuerySchema`
- [ ] `apps/web/src/server/use-cases/index.ts` — export 4 new use cases
- [ ] `apps/web/src/lib/swagger/definitions/` — add JSDoc for all 4 endpoints

---

## Acceptance Criteria

### Must Have (P0)
- [ ] **AC1**: `GET /api/me/interests` returns 200 with paginated interests for the authenticated guardian.
- [ ] **AC2**: `DELETE /api/pets/:id/interests/:interestId` returns 204 and deletes the row; 403 if wrong owner.
- [ ] **AC3**: `POST /api/workspaces/:id/interests/:interestId/convert` returns 201 with adoption; interest row deleted; pet status ADOPTED.
- [ ] **AC4**: `DELETE /api/workspaces/:id/interests/:interestId` returns 204 and deletes the row; 403 if not OWNER/EDITOR.
- [ ] **AC5**: All endpoints return 401 when unauthenticated.
- [ ] **AC6**: `pnpm lint` and `pnpm build` pass with 0 warnings.

---

## Test Strategy

For each route:
- Happy path with valid data
- Missing/invalid auth → 401
- Wrong role / wrong ownership → 403
- Not found → 404
- Invalid UUID → 400
- Business rule violation (pet already adopted) → 409
- DB side-effect confirmed via psql

---

## Dependencies

**Blocks:** None
**Blocked By:** None
**Related Work:** `adoption-follow-up-flow` (complete — `adoptionRepo.create` already creates follow-ups)
**New Libraries:** None

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Convert race condition (two workspaces convert same interest) | Low | High | `adoptionRepo.create` transaction catches duplicate petId via DB unique constraint |

---

## Complexity Estimate

**Overall**: Medium
- Backend: Medium (4 use cases, 4 routes, repository extension)
- Frontend: None

**Estimated Effort**: 3–5 hours
**Confidence**: High

---

## Approval

- [ ] Requirements clear and complete
- [ ] Technical approach sound
- [ ] Acceptance criteria testable
- [ ] Risks understood
