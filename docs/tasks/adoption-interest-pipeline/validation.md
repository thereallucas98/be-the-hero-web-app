# Validation: Adoption Interest Pipeline

**Date**: 2026-03-21
**Phase**: EXECUTION

---

## Acceptance Criteria

### AC1 — GET /api/me/interests
- [ ] 200 + paginated interests for authenticated guardian
- [ ] 401 when unauthenticated
- [ ] 400 on invalid query params
- [ ] Empty list (not error) when guardian has no interests

### AC2 — DELETE /api/pets/:id/interests/:interestId
- [ ] 204 + interest row deleted from DB
- [ ] 401 when unauthenticated
- [ ] 403 when interest belongs to another user
- [ ] 404 when interestId does not exist
- [ ] 400 on invalid UUID

### AC3 — POST /api/workspaces/:id/interests/:interestId/convert
- [ ] 201 + adoption object returned
- [ ] Interest row deleted from DB after convert
- [ ] Pet status set to ADOPTED in DB
- [ ] 3 AdoptionFollowUp rows created in DB
- [ ] 401 when unauthenticated
- [ ] 403 when caller is not workspace OWNER/EDITOR
- [ ] 404 when interestId not found or belongs to different workspace
- [ ] 409 when pet already adopted
- [ ] 409 when pet no longer APPROVED
- [ ] 400 on invalid UUID or body

### AC4 — DELETE /api/workspaces/:id/interests/:interestId
- [ ] 204 + interest row deleted from DB
- [ ] 401 when unauthenticated
- [ ] 403 when caller is not workspace OWNER/EDITOR
- [ ] 404 when interestId not found or belongs to different workspace
- [ ] 400 on invalid UUID

### AC5 — Non-functional
- [ ] `pnpm lint` passes with 0 errors, 0 warnings
- [ ] `pnpm build` succeeds
- [ ] Swagger docs visible at /api-docs for all 4 endpoints

---

## QA Results

### QA Gate A.1 — GET /api/me/interests

| Test | Expected | Result |
|---|---|---|
| GET with guardian cookie | 200 + items | — |
| GET unauthenticated | 401 | — |
| GET with invalid perPage | 400 | — |

### QA Gate A.2 — DELETE /api/pets/:id/interests/:interestId

| Test | Expected | Result |
|---|---|---|
| DELETE own interest | 204 | — |
| DB: row gone | deleted | — |
| DELETE another user's interest | 403 | — |
| DELETE nonexistent interestId | 404 | — |
| DELETE bad UUID | 400 | — |
| DELETE unauthenticated | 401 | — |

### QA Gate A.3 — POST convert

| Test | Expected | Result |
|---|---|---|
| POST valid convert | 201 + adoption | — |
| DB: interest deleted | gone | — |
| DB: pet status ADOPTED | ADOPTED | — |
| DB: 3 follow-ups created | 3 rows | — |
| POST unauthenticated | 401 | — |
| POST as guardian (not OWNER) | 403 | — |
| POST nonexistent interestId | 404 | — |
| POST pet already adopted | 409 | — |
| POST bad UUID | 400 | — |

### QA Gate A.4 — DELETE /api/workspaces/:id/interests/:interestId

| Test | Expected | Result |
|---|---|---|
| DELETE valid dismiss | 204 | — |
| DB: row gone | deleted | — |
| DELETE unauthenticated | 401 | — |
| DELETE as guardian | 403 | — |
| DELETE nonexistent interestId | 404 | — |
| DELETE bad UUID | 400 | — |
