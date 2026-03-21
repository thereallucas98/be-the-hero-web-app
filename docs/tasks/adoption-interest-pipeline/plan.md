# Plan: Adoption Interest Pipeline

**Date**: 2026-03-21
**Phase**: PLANNING
**Status**: Pending Approval

---

## Objective

Complete the adoption interest lifecycle:
- **A.1** Guardian lists own interests (`GET /api/me/interests`)
- **A.2** Guardian withdraws an interest (`DELETE /api/pets/:id/interests/:interestId`)
- **A.3** Workspace converts interest → adoption (`POST /api/workspaces/:id/interests/:interestId/convert`)
- **A.4** Workspace dismisses interest (`DELETE /api/workspaces/:id/interests/:interestId`)

---

## Architecture Overview

```
AdoptionInterestRepository (extend existing)
  + findById(id)
  + findByIdForWorkspace(id, workspaceId)
  + findByUserId(userId, { page, perPage })
  + deleteById(id)

Schemas (new file: server/schemas/adoption-interest.schema.ts)
  + ListMyInterestsQuerySchema
  + ConvertInterestSchema

Use Cases (4 new files under server/use-cases/adoption-interests/)
  + list-my-interests.use-case.ts
  + withdraw-adoption-interest.use-case.ts
  + convert-interest-to-adoption.use-case.ts
  + dismiss-adoption-interest.use-case.ts

Routes (3 new files)
  + app/api/me/interests/route.ts                                    (GET)
  + app/api/pets/[id]/interests/[interestId]/route.ts               (DELETE)
  + app/api/workspaces/[id]/interests/[interestId]/route.ts         (POST convert + DELETE dismiss)

Modified
  + server/repositories/adoption-interest.repository.ts  — 4 new methods
  + server/use-cases/index.ts                            — export 4 new use cases
  + lib/swagger/definitions/adoption-interests.ts        — new JSDoc file
```

---

## Sub-step Details

### Step 1 — Extend repository + new schemas

**Files:**
- `server/repositories/adoption-interest.repository.ts` — add 4 methods
- `server/schemas/adoption-interest.schema.ts` — new file

**New interface types:**
```typescript
InterestItem { id, userId, petId, workspaceId, message, createdAt }
InterestForWorkspaceItem { id, userId, petId, workspaceId }
MyInterestListItem {
  id, message, createdAt, channel,
  pet: { id, name, species, sex, size, ageCategory, coverImage: { url } | null }
}
ListMyInterestsResult { items, total, page, perPage }
```

**New methods:**
```typescript
findById(id): Promise<InterestItem | null>
findByIdForWorkspace(id, workspaceId): Promise<InterestForWorkspaceItem | null>
findByUserId(userId, { page, perPage }): Promise<ListMyInterestsResult>
deleteById(id): Promise<void>
```

`findByUserId` joins pet + pet.images (isCover=true, take 1).
`findByIdForWorkspace` uses `WHERE id = $id AND workspaceId = $workspaceId`.

**Schemas:**
```typescript
ListMyInterestsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(20).optional().default(10),
})

ConvertInterestSchema = z.object({
  notes: z.string().max(1000).optional(),
  adoptedAt: z.string().datetime().optional(),
}).strict()
```

**QA**: Schema/repository-only step — no route to test. Reply "ok" to continue.

---

### Step 2 — `listMyInterests` use case + `GET /api/me/interests`

**Files:**
- `server/use-cases/adoption-interests/list-my-interests.use-case.ts`
- `app/api/me/interests/route.ts`

**Use case:**
- Input: `{ principal, page?, perPage? }`
- Guard: `!principal` → `UNAUTHENTICATED`
- Calls `adoptionInterestRepo.findByUserId(principal.userId, { page, perPage })`
- Returns: `{ success: true; items; total; page; perPage }`

**Route:**
- Parses `ListMyInterestsQuerySchema` from search params
- Maps: `UNAUTHENTICATED` → 401

**QA gate A.1**

---

### Step 3 — `withdrawAdoptionInterest` use case + `DELETE /api/pets/:id/interests/:interestId`

**Files:**
- `server/use-cases/adoption-interests/withdraw-adoption-interest.use-case.ts`
- `app/api/pets/[id]/interests/[interestId]/route.ts`

**Use case:**
- Input: `{ principal, interestId }`
- Guard: `!principal` → `UNAUTHENTICATED`
- `findById(interestId)` → `NOT_FOUND` if null
- `interest.userId !== principal.userId` → `FORBIDDEN`
- `deleteById(interestId)`
- Returns: `{ success: true }`

**Route:**
- Validates both `id` (petId) and `interestId` as UUIDs
- Returns 204 on success
- Maps: `UNAUTHENTICATED` → 401, `NOT_FOUND` → 404, `FORBIDDEN` → 403

Note: `petId` from path is validated (UUID format) but not used by the use case — ownership is established via `interest.userId`. This matches REST convention for the nested resource URL.

**QA gate A.2**

---

### Step 4 — `convertInterestToAdoption` use case + `POST .../convert`

**Files:**
- `server/use-cases/adoption-interests/convert-interest-to-adoption.use-case.ts`
- `app/api/workspaces/[id]/interests/[interestId]/route.ts` (POST handler)

**Use case:**
- Input: `{ principal, workspaceId, interestId, notes?, adoptedAt? }`
- Guard: `!principal` → `UNAUTHENTICATED`
- `findByIdForWorkspace(interestId, workspaceId)` → `NOT_FOUND` if null
- `workspaceRepo.findByIdForInterestsAccess(workspaceId)` → `NOT_FOUND` if null
- RBAC: OWNER/EDITOR of workspace or SUPER_ADMIN → else `FORBIDDEN`
- `petRepo.findByIdForAdoption(interest.petId)` → `NOT_FOUND` if null
- `pet.hasAdoption` → `PET_ALREADY_ADOPTED`
- `pet.status !== 'APPROVED'` → `PET_NOT_APPROVED`
- `!pet.workspace.isActive || pet.workspace.verificationStatus !== 'APPROVED'` → `WORKSPACE_BLOCKED`
- `adoptionRepo.create({ petId, guardianUserId: interest.userId, workspaceId, adoptedAt, notes, createdByUserId: principal.userId })`
- Catch `Prisma.PrismaClientKnownRequestError` P2002 → `PET_ALREADY_ADOPTED`
- `adoptionInterestRepo.deleteById(interestId)`
- Returns: `{ success: true; adoption: CreatedAdoptionItem }`

**Route:**
- Returns 201 on success
- Maps: `UNAUTHENTICATED`→401, `FORBIDDEN`→403, `NOT_FOUND`→404, `PET_ALREADY_ADOPTED`→409, `PET_NOT_APPROVED`→409, `WORKSPACE_BLOCKED`→409

**QA gate A.3**

---

### Step 5 — `dismissAdoptionInterest` use case + `DELETE .../[interestId]`

**Files:**
- `server/use-cases/adoption-interests/dismiss-adoption-interest.use-case.ts`
- `app/api/workspaces/[id]/interests/[interestId]/route.ts` (DELETE handler — same file as step 4)

**Use case:**
- Input: `{ principal, workspaceId, interestId }`
- Guard: `!principal` → `UNAUTHENTICATED`
- `findByIdForWorkspace(interestId, workspaceId)` → `NOT_FOUND` if null
- `workspaceRepo.findByIdForInterestsAccess(workspaceId)` → `NOT_FOUND` if null
- RBAC: OWNER/EDITOR or SUPER_ADMIN → else `FORBIDDEN`
- `deleteById(interestId)`
- Returns: `{ success: true }`

**Route:**
- DELETE handler on same file as step 4
- Returns 204 on success

**QA gate A.4**

---

### Step 6 — Wire exports + Swagger

**Files:**
- `server/use-cases/index.ts` — export 4 new use cases
- `lib/swagger/definitions/adoption-interests.ts` — JSDoc for all 4 endpoints

**QA**: lint + build

---

## Error Code → HTTP Map

| Code | Status |
|---|---|
| `UNAUTHENTICATED` | 401 |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404 |
| `PET_ALREADY_ADOPTED` | 409 |
| `PET_NOT_APPROVED` | 409 |
| `WORKSPACE_BLOCKED` | 409 |

---

## Execution Order

1. Step 1: extend repository + schemas
2. Step 2: `listMyInterests` → QA gate A.1
3. Step 3: `withdrawAdoptionInterest` → QA gate A.2
4. Step 4: `convertInterestToAdoption` → QA gate A.3
5. Step 5: `dismissAdoptionInterest` → QA gate A.4
6. Step 6: wire exports + Swagger + lint + build

---

## Out of Scope

- Email/push notifications on dismiss or convert
- Interest history / soft delete
- Frontend UI
