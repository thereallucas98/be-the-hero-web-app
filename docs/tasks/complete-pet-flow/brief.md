# Task Brief: Complete Pet Flow

**Created**: 2026-03-11
**Status**: Pending Approval
**Complexity**: Medium
**Type**: API Endpoints
**Estimated Effort**: 5-7 hours

---

## Feature Overview

### User Story

As a potential adopter, I want to see full pet details (images, requirements) so I can decide whether to register interest.

As a workspace partner, I want to manage my pets list (all statuses) and define adoption requirements so I can qualify applicants.

As a platform operator, I want to track engagement events (views, WhatsApp clicks, interest registrations) so I can measure adoption funnel performance.

### Problem Statement

The core pet lifecycle is 80% implemented: partners can create pets, add images, submit for review, and admins can approve/reject. However, the public-facing pet detail endpoint is missing, adoption requirements exist in the schema but have zero routes, partners have no way to list their own pets by status, the public listing lacks key filters, and there is no event tracking for analytics.

### Scope

**In Scope:**
- 1.1 Public pet detail (`GET /api/pets/:id` — full info: images, requirements, workspace)
- 1.2 Pet requirements CRUD (3 routes: POST, PATCH, DELETE on `/pets/:id/requirements[/:reqId]`)
- 1.3 Partner pet list (`GET /api/workspaces/:id/pets` — internal list with status filter and pagination)
- 1.4 Enhanced public listing filters (add `sex`, `size`, `ageCategory` to `GET /api/pets`)
- 1.5 Metric event tracking (`POST /api/pets/:id/track` — anonymous, stores VIEW_PET / CLICK_WHATSAPP / REGISTER_INTEREST)

**Out of Scope:**
- Follow-up submission workflow (Phase 3)
- Geo endpoints (`/api/geo/states`, `/api/geo/cities`) (Phase 2)
- Campaign management (Phase 4)
- Media upload / cloud storage (images are URL-based stubs)

---

## Current State

**Key Files:**
- `apps/web/src/app/api/pets/[id]/route.ts` — PATCH only (no GET)
- `apps/web/src/app/api/pets/route.ts` — GET (list) with `cityPlaceId` and `species` filters only
- `apps/web/src/server/repositories/pet.repository.ts` — no `findByIdPublic`, no `listByWorkspace`, no requirements methods, no `trackEvent`
- `apps/web/src/server/use-cases/pets/` — 7 use cases (create, update, submit, images, list-public); no detail, requirements, or tracking
- `apps/web/prisma/schema.prisma` — `PetRequirement` and `PetMetricEvent` models exist but are unused by routes

**Gaps/Issues:**
- `GET /api/pets/:id` does not exist — guardians cannot see full pet details before registering interest
- `PetRequirement` table has no CRUD routes (partners can't define adoption requirements)
- Partners have no endpoint to list their own pets by status (needed for a management dashboard)
- `GET /api/pets` only filters by `cityPlaceId` and `species` — missing `sex`, `size`, `ageCategory`
- `PetMetricEvent` table is never written to despite being in the schema

---

## Requirements

### Functional Requirements

**FR1: Public Pet Detail**
- **Trigger**: Anyone GETs `/api/pets/:id`
- **Expected**: Full pet data — all fields, images (sorted by position), requirements (sorted by order), workspace name/id, cover image
- **Edge Cases**: Only APPROVED pets are visible publicly; 404 for non-approved or inactive pets

**FR2: Pet Requirements CRUD**
- **Trigger**: Workspace OWNER or EDITOR manages requirements
- **Expected**: Can add (POST), update title/description/isMandatory/order (PATCH), and remove (DELETE) requirements
- **Edge Cases**: Order is unique per pet — adding a requirement with a conflicting order shifts existing requirements; RBAC: only OWNER/EDITOR of the pet's workspace

**FR3: Partner Pet List**
- **Trigger**: Workspace member GETs `/api/workspaces/:id/pets`
- **Expected**: Paginated list of workspace pets, filterable by `status`; any workspace member (OWNER/EDITOR/FINANCIAL) can view
- **Edge Cases**: Returns ALL statuses (including DRAFT) for internal view; admin role can see any workspace

**FR4: Enhanced Public Listing Filters**
- **Trigger**: Anyone GETs `/api/pets` with additional filters
- **Expected**: New optional query params — `sex`, `size`, `ageCategory` — applied alongside existing `cityPlaceId` and `species`
- **Edge Cases**: Unknown enum values return 400

**FR5: Metric Event Tracking**
- **Trigger**: Frontend POSTs to `/api/pets/:id/track`
- **Expected**: Creates a `PetMetricEvent` record with `type` (VIEW_PET, CLICK_WHATSAPP, REGISTER_INTEREST); no auth required
- **Edge Cases**: Only APPROVED pets can be tracked; unknown `type` returns 400

---

## Technical Approach

**Chosen Approach:** Same pattern — thin routes, use cases, repositories. No new patterns.

New repo methods added to `PetRepository`. New use cases in `server/use-cases/pets/`. New schemas in `server/schemas/pet.schema.ts`.

**Key Decisions:**
- Public pet detail: no auth required — returns 404 for non-APPROVED pets (avoid status enumeration)
- Requirements order: managed explicitly by caller (no auto-shift); unique constraint enforced at DB level → 409 on conflict
- Metric events: anonymous, no auth — IP/session tracking is out of scope
- Partner pet list: any workspace member can view (OWNER, EDITOR, FINANCIAL)
- Enhanced filters: add query params to existing `list-pets.use-case.ts` and `PetRepository.listPublicPets`

---

## Files to Change

### New Files
- [ ] `server/use-cases/pets/get-pet-detail.use-case.ts`
- [ ] `server/use-cases/pets/add-pet-requirement.use-case.ts`
- [ ] `server/use-cases/pets/update-pet-requirement.use-case.ts`
- [ ] `server/use-cases/pets/remove-pet-requirement.use-case.ts`
- [ ] `server/use-cases/pets/list-workspace-pets.use-case.ts`
- [ ] `server/use-cases/pets/track-pet-event.use-case.ts`
- [ ] `server/schemas/pet.schema.ts` (new — AddPetRequirementSchema, UpdatePetRequirementSchema, TrackPetEventSchema, ListWorkspacePetsQuerySchema, enhanced ListPetsQuerySchema)
- [ ] `app/api/pets/[id]/requirements/route.ts` (POST)
- [ ] `app/api/pets/[id]/requirements/[reqId]/route.ts` (PATCH + DELETE)
- [ ] `app/api/workspaces/[id]/pets/route.ts` (GET)
- [ ] `app/api/pets/[id]/track/route.ts` (POST)

### Modified Files
- [ ] `server/repositories/pet.repository.ts` — add `findByIdPublic`, `listByWorkspace`, `addRequirement`, `findRequirement`, `updateRequirement`, `removeRequirement`, `trackEvent`
- [ ] `server/use-cases/pets/list-pets.use-case.ts` — pass `sex`, `size`, `ageCategory` filters through
- [ ] `app/api/pets/[id]/route.ts` — add GET handler
- [ ] `app/api/pets/route.ts` — add `sex`, `size`, `ageCategory` query params
- [ ] `server/use-cases/index.ts` — export all new use cases

---

## Acceptance Criteria

### Must Have (P0)
- [ ] **AC1**: `GET /api/pets/:id` returns full pet with images and requirements for APPROVED pets
- [ ] **AC2**: `GET /api/pets/:id` returns 404 for DRAFT / PENDING_REVIEW / REJECTED / ADOPTED pets
- [ ] **AC3**: `POST /api/pets/:id/requirements` OWNER/EDITOR can add requirements
- [ ] **AC4**: `PATCH /api/pets/:id/requirements/:reqId` OWNER/EDITOR can update requirement
- [ ] **AC5**: `DELETE /api/pets/:id/requirements/:reqId` OWNER/EDITOR can remove requirement
- [ ] **AC6**: `GET /api/workspaces/:id/pets` returns paginated pet list with status filter
- [ ] **AC7**: `GET /api/pets` supports `sex`, `size`, `ageCategory` filters
- [ ] **AC8**: `POST /api/pets/:id/track` records metric event; no auth required
- [ ] **AC9**: `POST /api/pets/:id/track` returns 404 for non-APPROVED pets
- [ ] **AC10**: All new endpoints return proper 401/403/404/400 on violations

### Should Have (P1)
- [ ] **AC11**: Requirements are included in public pet detail response, sorted by `order`
- [ ] **AC12**: `GET /api/workspaces/:id/pets` FINANCIAL member can view list (read-only)

---

## Test Strategy

**API endpoints** (for each route):
- Happy path with valid data
- Missing auth → 401 (where required)
- Wrong role/ownership → 403
- Invalid body → 400 with details
- Resource not found → 404
- Business rule violation → 409 (duplicate order)

---

## Dependencies

**Blocks:** Phase 3 (Follow-up workflow) — depends on public pet detail
**Blocked By:** Phase 0 (Complete) — workspace RBAC patterns established
**Related Work:** `PetRequirement` and `PetMetricEvent` models already exist in the schema

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Requirement order uniqueness conflict | Medium | Low | Return 409 with `ORDER_CONFLICT`; caller manages order |
| Metric events generate high write volume | Low | Low | Simple insert — no aggregation needed now |
| Partner pet list exposes DRAFT pets to unrelated members | Low | Medium | Strict RBAC: only workspace members can see their own workspace |

---

## Complexity Estimate

**Overall**: Medium
- Backend: Medium (6 new use cases, 6 new routes, 7 new repo methods, 2 modified use cases)
- Frontend: None

**Estimated Effort**: 5-7 hours
**Confidence**: High

---

## Approval

**Status**: Pending

- [ ] Requirements clear and complete
- [ ] Technical approach sound
- [ ] Acceptance criteria testable
- [ ] Risks understood
