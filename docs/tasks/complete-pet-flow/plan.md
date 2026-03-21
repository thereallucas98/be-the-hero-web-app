# Plan: Complete Pet Flow

**Date**: 2026-03-11
**Phase**: PLANNING
**Status**: Pending Approval

---

## Objective

Complete the pet adoption flow by adding 6 missing capabilities:
- **1.1** Public pet detail (`GET /api/pets/:id`)
- **1.2** Pet requirements CRUD (POST/PATCH/DELETE on `/api/pets/:id/requirements[/:reqId]`)
- **1.3** Partner pet list (`GET /api/workspaces/:id/pets` — internal, all statuses)
- **1.4** Enhanced public listing filters (sex, size, ageCategory added to `GET /api/pets`)
- **1.5** Metric event tracking (`POST /api/pets/:id/track` — anonymous)

---

## Architecture Overview

```
PetRepository (+7 methods)
  + findByIdPublic(id)
  + listByWorkspace(workspaceId, opts)
  + addRequirement(petId, data)
  + findRequirementById(reqId, petId)
  + updateRequirement(reqId, petId, data)
  + removeRequirement(reqId, petId)
  + trackEvent(petId, workspaceId, type)

Schemas (new file: server/schemas/pet.schema.ts)
  + AddPetRequirementSchema
  + UpdatePetRequirementSchema
  + TrackPetEventSchema
  + ListWorkspacePetsQuerySchema
  + ListPetsQuerySchema (replaces inline validation in route)

Use Cases (6 new files)
  pets/get-pet-detail.use-case.ts
  pets/add-pet-requirement.use-case.ts
  pets/update-pet-requirement.use-case.ts
  pets/remove-pet-requirement.use-case.ts
  pets/list-workspace-pets.use-case.ts
  pets/track-pet-event.use-case.ts

Modified Use Cases (1)
  pets/list-pets.use-case.ts — pass sex, size, ageCategory through

Routes (5 new files + 2 modified)
  NEW: app/api/pets/[id]/requirements/route.ts        (POST)
  NEW: app/api/pets/[id]/requirements/[reqId]/route.ts (PATCH + DELETE)
  NEW: app/api/workspaces/[id]/pets/route.ts          (GET)
  NEW: app/api/pets/[id]/track/route.ts               (POST)
  MOD: app/api/pets/[id]/route.ts                     (+GET handler)
  MOD: app/api/pets/route.ts                          (+sex, size, ageCategory query params)
```

---

## Sub-Step Details

### Sub-step 1.1 — Public Pet Detail

**Files**:
- `server/repositories/pet.repository.ts` — add `findByIdPublic`
- `server/use-cases/pets/get-pet-detail.use-case.ts` (NEW)
- `server/use-cases/index.ts` — export
- `app/api/pets/[id]/route.ts` — add GET handler

**Key contracts**:

`findByIdPublic(id)`:
- Where: `{ id, status: 'APPROVED', isActive: true }`
- Select: all pet fields + images (sorted by position) + requirements (sorted by order) + workspace: `{ id, name }`
- Returns: `PublicPetDetailItem | null`

`get-pet-detail`:
- No principal required (public)
- `petRepo.findByIdPublic(id)` → if null → `{ success: false, code: 'NOT_FOUND' }`
- Result: `{ success: true; pet: PublicPetDetailItem }`

**Response shape**:
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "species": "DOG",
  "sex": "MALE",
  "size": "MEDIUM",
  "ageCategory": "ADULT",
  "energyLevel": "HIGH",
  "independenceLevel": "MEDIUM",
  "environment": "BOTH",
  "adoptionRequirements": "string | null",
  "images": [{ "id": "uuid", "url": "string", "position": 1, "isCover": true }],
  "requirements": [{ "id": "uuid", "category": "HOME", "title": "string", "description": "string | null", "isMandatory": true, "order": 1 }],
  "workspace": { "id": "uuid", "name": "string" },
  "approvedAt": "ISO-8601"
}
```

**Route method**: `GET /api/pets/:id` (no auth)

---

### Sub-step 1.2 — Pet Requirements CRUD

**Files**:
- `server/repositories/pet.repository.ts` — add `addRequirement`, `findRequirementById`, `updateRequirement`, `removeRequirement`
- `server/schemas/pet.schema.ts` (NEW) — `AddPetRequirementSchema`, `UpdatePetRequirementSchema`
- `server/use-cases/pets/add-pet-requirement.use-case.ts` (NEW)
- `server/use-cases/pets/update-pet-requirement.use-case.ts` (NEW)
- `server/use-cases/pets/remove-pet-requirement.use-case.ts` (NEW)
- `server/use-cases/index.ts` — export all three
- `app/api/pets/[id]/requirements/route.ts` (NEW — POST)
- `app/api/pets/[id]/requirements/[reqId]/route.ts` (NEW — PATCH + DELETE)

**Key contracts**:

`add-pet-requirement`:
- Input: `{ principal, petId, category, title, description?, isMandatory?, order }`
- RBAC: caller must be OWNER or EDITOR of pet's workspace
- `petRepo.findByIdWithWorkspace(petId)` — 404 if not found
- `petRepo.addRequirement(petId, data)` — P2002 → `ORDER_CONFLICT`
- Result: `{ success: true; requirement }` or `{ success: false; code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'FORBIDDEN' | 'ORDER_CONFLICT' }`

`update-pet-requirement`:
- Input: `{ principal, petId, reqId, ...partialData }`
- RBAC: same as add
- `petRepo.findRequirementById(reqId, petId)` — 404 if not found
- `petRepo.updateRequirement(reqId, petId, data)` — P2002 → `ORDER_CONFLICT`
- Result: `{ success: true; requirement }` or `{ success: false; code }`

`remove-pet-requirement`:
- Input: `{ principal, petId, reqId }`
- RBAC: OWNER or EDITOR
- `petRepo.removeRequirement(reqId, petId)` — false → 404
- Result: `{ success: true }` or `{ success: false; code }`

**Schemas**:
```typescript
AddPetRequirementSchema = z.object({
  category: z.enum(['HOME', 'EXPERIENCE', 'TIME_AVAILABILITY', 'FINANCIAL', 'SAFETY', 'HEALTH_CARE', 'OTHER']),
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  isMandatory: z.boolean().default(true),
  order: z.number().int().min(1),
}).strict()

UpdatePetRequirementSchema = z.object({
  category: z.enum([...]).optional(),
  title: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  isMandatory: z.boolean().optional(),
  order: z.number().int().min(1).optional(),
}).strict()
```

**Route methods**: `POST /api/pets/:id/requirements`, `PATCH /api/pets/:id/requirements/:reqId`, `DELETE /api/pets/:id/requirements/:reqId`

---

### Sub-step 1.3 — Partner Pet List

**Files**:
- `server/repositories/pet.repository.ts` — add `listByWorkspace`
- `server/schemas/pet.schema.ts` — add `ListWorkspacePetsQuerySchema`
- `server/use-cases/pets/list-workspace-pets.use-case.ts` (NEW)
- `server/use-cases/index.ts` — export
- `app/api/workspaces/[id]/pets/route.ts` (NEW — GET)

**Key contracts**:

`listByWorkspace(workspaceId, opts)`:
- Filter by `status` (optional); no isActive filter (includes all)
- Paginated: `page`, `perPage` (max 50)
- Select: id, name, species, sex, size, ageCategory, status, coverImage, createdAt, updatedAt
- Returns: `{ items, total, page, perPage }`

`list-workspace-pets`:
- Input: `{ principal, workspaceId, status?, page, perPage }`
- RBAC: workspace member (OWNER, EDITOR, FINANCIAL) OR SUPER_ADMIN/ADMIN
- `workspaceRepo.findByIdWithDetails(workspaceId)` — 404 if not found or inactive
- `petRepo.listByWorkspace(workspaceId, opts)`
- Result: `{ success: true; items; total; page; perPage }`

**Schema**:
```typescript
ListWorkspacePetsQuerySchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ADOPTED']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(50).optional().default(20),
})
```

**Route method**: `GET /api/workspaces/:id/pets`

---

### Sub-step 1.4 — Enhanced Public Listing Filters

**Files**:
- `server/repositories/pet.repository.ts` — update `listPublicPets` to accept `sex`, `size`, `ageCategory`
- `server/schemas/pet.schema.ts` — add `ListPetsQuerySchema`
- `server/use-cases/pets/list-pets.use-case.ts` — pass new filters through
- `app/api/pets/route.ts` — add `sex`, `size`, `ageCategory` query params

**Key contracts**:

`listPublicPets` input extended:
```typescript
interface ListPublicPetsInput {
  cityPlaceId?: string
  species?: string
  sex?: string       // NEW
  size?: string      // NEW
  ageCategory?: string // NEW
  page?: number
  perPage?: number
}
```

Where clause additions:
```typescript
if (input.sex) where.sex = input.sex
if (input.size) where.size = input.size
if (input.ageCategory) where.ageCategory = input.ageCategory
```

**Schema** (for route query params):
```typescript
ListPetsQuerySchema = z.object({
  cityPlaceId: z.uuid().optional(),
  species: z.enum([...PetSpecies values...]).optional(),
  sex: z.enum(['MALE', 'FEMALE']).optional(),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE']).optional(),
  ageCategory: z.enum(['PUPPY', 'YOUNG', 'ADULT', 'SENIOR']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(20).optional().default(20),
})
```

**Route method**: `GET /api/pets` (modified — no new route file)

---

### Sub-step 1.5 — Metric Event Tracking

**Files**:
- `server/repositories/pet.repository.ts` — add `trackEvent`, `findByIdForTracking`
- `server/schemas/pet.schema.ts` — add `TrackPetEventSchema`
- `server/use-cases/pets/track-pet-event.use-case.ts` (NEW)
- `server/use-cases/index.ts` — export
- `app/api/pets/[id]/track/route.ts` (NEW — POST)

**Key contracts**:

`findByIdForTracking(id)`:
- Select: `{ id, workspaceId, status }`
- Returns `null` if not found

`trackEvent(petId, workspaceId, type)`:
- Simple insert into `petMetricEvent`
- No return value needed

`track-pet-event`:
- Input: `{ petId, type }` (no auth required)
- `petRepo.findByIdForTracking(petId)` — null or non-APPROVED → `NOT_FOUND`
- `petRepo.trackEvent(petId, pet.workspaceId, type)`
- Result: `{ success: true }` or `{ success: false; code: 'NOT_FOUND' | 'INVALID_TYPE' }`

**Schema**:
```typescript
TrackPetEventSchema = z.object({
  type: z.enum(['VIEW_PET', 'CLICK_WHATSAPP', 'REGISTER_INTEREST']),
}).strict()
```

**Route method**: `POST /api/pets/:id/track` (no auth)

---

## Error Code → HTTP Status Map

| Code | Status |
|------|--------|
| `NOT_FOUND` | 404 |
| `FORBIDDEN` | 403 |
| `UNAUTHENTICATED` | 401 |
| `ORDER_CONFLICT` | 409 |
| `INVALID_TYPE` | 400 |

---

## Execution Order

1. Repository layer — all new `PetRepository` methods
2. Schemas — new `pet.schema.ts`
3. Use cases — per sub-step
4. Routes — per sub-step
5. `use-cases/index.ts` — export all new use cases
6. Modify existing: `list-pets.use-case.ts` + `app/api/pets/route.ts`

---

## Out of Scope

- Follow-up submission workflow (Phase 3)
- Geo endpoints (Phase 2)
- Campaign management (Phase 4)
- Re-ordering requirements in bulk (caller manages order individually)
