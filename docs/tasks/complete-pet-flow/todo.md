# TODO: Complete Pet Flow

**Date**: 2026-03-11
**Phase**: EXECUTION
**Status**: Complete

---

## Implementation Checklist

### Phase 1: Repository Layer

- [x] **1.1** `pet.repository.ts` — add `findByIdPublic(id)`
- [x] **1.2** `pet.repository.ts` — add `listByWorkspace(workspaceId, opts)`
- [x] **1.3** `pet.repository.ts` — add `addRequirement(petId, data)`
- [x] **1.4** `pet.repository.ts` — add `findRequirementById(reqId, petId)`
- [x] **1.5** `pet.repository.ts` — add `updateRequirement(reqId, petId, data)`
- [x] **1.6** `pet.repository.ts` — add `removeRequirement(reqId, petId)`
- [x] **1.7** `pet.repository.ts` — add `findByIdForTracking(id)`
- [x] **1.8** `pet.repository.ts` — add `trackEvent(petId, workspaceId, type)`
- [x] **1.9** `pet.repository.ts` — update `listPublicPets` to accept `sex`, `size`, `ageCategory`

### Phase 2: Schemas

- [x] **2.1** `server/schemas/pet.schema.ts` — `AddPetRequirementSchema`, `UpdatePetRequirementSchema`, `TrackPetEventSchema`, `ListWorkspacePetsQuerySchema`, `ListPetsQuerySchema` (updated)

### Phase 3: Use Cases — Sub-step 1.1 (Public Pet Detail)

- [x] **3.1** `pets/get-pet-detail.use-case.ts` — NEW

### Phase 4: Route — Sub-step 1.1

- [x] **4.1** `app/api/pets/[id]/route.ts` — add GET handler

### Phase 5: Use Cases — Sub-step 1.2 (Requirements CRUD)

- [x] **5.1** `pets/add-pet-requirement.use-case.ts` — NEW
- [x] **5.2** `pets/update-pet-requirement.use-case.ts` — NEW
- [x] **5.3** `pets/remove-pet-requirement.use-case.ts` — NEW

### Phase 6: Routes — Sub-step 1.2

- [x] **6.1** `app/api/pets/[id]/requirements/route.ts` — NEW (POST)
- [x] **6.2** `app/api/pets/[id]/requirements/[reqId]/route.ts` — NEW (PATCH + DELETE)

### Phase 7: Use Case — Sub-step 1.3 (Partner Pet List)

- [x] **7.1** `pets/list-workspace-pets.use-case.ts` — NEW

### Phase 8: Route — Sub-step 1.3

- [x] **8.1** `app/api/workspaces/[id]/pets/route.ts` — GET added

### Phase 9: Sub-step 1.4 (Enhanced Public Filters)

- [x] **9.1** `pets/list-pets.use-case.ts` — pass `sex`, `size`, `ageCategory` through to repository
- [x] **9.2** `app/api/pets/route.ts` — add `sex`, `size`, `ageCategory` query params

### Phase 10: Use Case — Sub-step 1.5 (Metric Tracking)

- [x] **10.1** `pets/track-pet-event.use-case.ts` — NEW

### Phase 11: Route — Sub-step 1.5

- [x] **11.1** `app/api/pets/[id]/track/route.ts` — NEW (POST)

### Phase 12: Wiring

- [x] **12.1** `server/use-cases/index.ts` — export all 6 new use cases with types
- [x] **12.2** Final TypeScript check (no errors) — lint ✓, build ✓

---

## Progress Notes

| Step | Status | Notes |
|------|--------|-------|
| 1.1–1.9 | Done | |
| 2.1 | Done | |
| 3.1 | Done | |
| 4.1 | Done | QA gate 1.1 ✓ |
| 5.1–5.3 | Done | |
| 6.1–6.2 | Done | QA gate 1.2 ✓ |
| 7.1 | Done | |
| 8.1 | Done | QA gate 1.3 ✓ |
| 9.1–9.2 | Done | QA gate 1.4 ✓ |
| 10.1 | Done | |
| 11.1 | Done | QA gate 1.5 ✓ |
| 12.1–12.2 | Done | lint ✓ build ✓ |
