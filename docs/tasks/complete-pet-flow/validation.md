# Validation: Complete Pet Flow

**Date**: 2026-03-11
**Phase**: PLANNING
**Status**: Pending Implementation

---

## Pre-Implementation Criteria

### Functional Criteria

| ID | Criterion | Sub-step |
|----|-----------|----------|
| F1 | `GET /api/pets/:id` returns full pet (images, requirements, workspace) for APPROVED pets | 1.1 |
| F2 | `GET /api/pets/:id` returns 404 for DRAFT, PENDING_REVIEW, REJECTED, ADOPTED pets | 1.1 |
| F3 | `GET /api/pets/:id` returns 404 for inactive pets | 1.1 |
| F4 | `POST /api/pets/:id/requirements` OWNER/EDITOR can add requirement | 1.2 |
| F5 | `POST /api/pets/:id/requirements` duplicate order returns 409 | 1.2 |
| F6 | `PATCH /api/pets/:id/requirements/:reqId` updates requirement fields | 1.2 |
| F7 | `DELETE /api/pets/:id/requirements/:reqId` removes requirement | 1.2 |
| F8 | Non-member cannot manage requirements (403) | 1.2 |
| F9 | `GET /api/workspaces/:id/pets` returns all-status list for workspace members | 1.3 |
| F10 | `GET /api/workspaces/:id/pets?status=DRAFT` filters by status | 1.3 |
| F11 | `GET /api/workspaces/:id/pets` non-member gets 403 | 1.3 |
| F12 | `GET /api/pets?sex=FEMALE` filters by sex | 1.4 |
| F13 | `GET /api/pets?size=SMALL` filters by size | 1.4 |
| F14 | `GET /api/pets?ageCategory=PUPPY` filters by age category | 1.4 |
| F15 | `GET /api/pets?sex=INVALID` returns 400 | 1.4 |
| F16 | `POST /api/pets/:id/track` records event without auth | 1.5 |
| F17 | `POST /api/pets/:id/track` returns 404 for non-APPROVED pets | 1.5 |
| F18 | `POST /api/pets/:id/track` returns 400 for invalid event type | 1.5 |

### Architectural Criteria

| ID | Criterion |
|----|-----------|
| A1 | No auth required for `GET /api/pets/:id` and `POST /api/pets/:id/track` |
| A2 | All use cases return discriminated union `{ success: true } | { success: false; code }` |
| A3 | RBAC for requirements and partner list uses `getPrincipal(req)` |
| A4 | No business logic in route handlers |
| A5 | P2002 from addRequirement / updateRequirement caught and returned as `ORDER_CONFLICT` |

---

## QA Checklist: Sub-step 1.1 — Public Pet Detail

```
GET /api/pets/<approved-pet-id>
  Expected: 200 with full pet data including images array and requirements array

GET /api/pets/<draft-pet-id>
  Expected: 404

GET /api/pets/<non-existent-uuid>
  Expected: 404

GET /api/pets/not-a-uuid
  Expected: 400

# Verify requirements array is sorted by order asc
# Verify images array is sorted by position asc
# Verify isCover is present on images
```

---

## QA Checklist: Sub-step 1.2 — Pet Requirements CRUD

```
POST /api/pets/<pet-id>/requirements
  Headers: Cookie: bth_access=<OWNER token>
  Body: { "category": "HOME", "title": "House with yard", "isMandatory": true, "order": 1 }
  Expected: 201 { "requirement": { "id": "...", "category": "HOME", ... } }

POST /api/pets/<pet-id>/requirements (duplicate order)
  Body: { "category": "EXPERIENCE", "title": "Has dogs before", "order": 1 }
  Expected: 409 { "code": "ORDER_CONFLICT" }

POST /api/pets/<pet-id>/requirements
  Headers: Cookie: bth_access=<EDITOR token>
  Expected: 201 (EDITOR can also add)

POST /api/pets/<pet-id>/requirements
  Headers: Cookie: bth_access=<unrelated user>
  Expected: 403

GET /api/pets/<pet-id> (after adding requirements)
  Expected: 200 with requirements array populated and sorted by order

PATCH /api/pets/<pet-id>/requirements/<reqId>
  Body: { "title": "House with fenced yard" }
  Expected: 200 { "requirement": { ... updated ... } }

DELETE /api/pets/<pet-id>/requirements/<reqId>
  Expected: 200 { "message": "Requirement removed" }

DELETE /api/pets/<pet-id>/requirements/non-existent-uuid
  Expected: 404
```

---

## QA Checklist: Sub-step 1.3 — Partner Pet List

```
GET /api/workspaces/<id>/pets
  Headers: Cookie: bth_access=<OWNER token>
  Expected: 200 { "items": [...], "total": N, "page": 1, "perPage": 20 }
  Note: items include DRAFT pets (all statuses)

GET /api/workspaces/<id>/pets?status=APPROVED
  Expected: 200 with only APPROVED pets

GET /api/workspaces/<id>/pets?status=DRAFT
  Expected: 200 with only DRAFT pets

GET /api/workspaces/<id>/pets
  No auth
  Expected: 401

GET /api/workspaces/<id>/pets
  Headers: Cookie: bth_access=<unrelated user>
  Expected: 403

GET /api/workspaces/<non-existent-id>/pets
  Expected: 404

GET /api/workspaces/<id>/pets?page=2&perPage=5
  Expected: 200 with correct pagination metadata
```

---

## QA Checklist: Sub-step 1.4 — Enhanced Public Listing Filters

```
GET /api/pets?sex=FEMALE
  Expected: 200 — all items have sex === FEMALE

GET /api/pets?size=SMALL
  Expected: 200 — all items have size === SMALL

GET /api/pets?ageCategory=PUPPY
  Expected: 200 — all items have ageCategory === PUPPY

GET /api/pets?sex=FEMALE&size=SMALL&species=DOG
  Expected: 200 — all filters applied (AND logic)

GET /api/pets?sex=INVALID_VALUE
  Expected: 400 with details

GET /api/pets?ageCategory=BABY
  Expected: 400 with details
```

---

## QA Checklist: Sub-step 1.5 — Metric Event Tracking

```
POST /api/pets/<approved-pet-id>/track
  No auth
  Body: { "type": "VIEW_PET" }
  Expected: 200 { "message": "Event recorded" }

POST /api/pets/<approved-pet-id>/track
  Body: { "type": "CLICK_WHATSAPP" }
  Expected: 200

POST /api/pets/<draft-pet-id>/track
  Body: { "type": "VIEW_PET" }
  Expected: 404

POST /api/pets/<non-existent-uuid>/track
  Expected: 404

POST /api/pets/<approved-pet-id>/track
  Body: { "type": "UNKNOWN_EVENT" }
  Expected: 400

POST /api/pets/<approved-pet-id>/track
  Body: {}
  Expected: 400 (type is required)
```

---

## Post-Implementation Results

_To be filled after EXECUTION phase_

### Functional Tests

| ID | Result | Notes |
|----|--------|-------|
| F1 | ⬜ | |
| F2 | ⬜ | |
| F3 | ⬜ | |
| F4 | ⬜ | |
| F5 | ⬜ | |
| F6 | ⬜ | |
| F7 | ⬜ | |
| F8 | ⬜ | |
| F9 | ⬜ | |
| F10 | ⬜ | |
| F11 | ⬜ | |
| F12 | ⬜ | |
| F13 | ⬜ | |
| F14 | ⬜ | |
| F15 | ⬜ | |
| F16 | ⬜ | |
| F17 | ⬜ | |
| F18 | ⬜ | |

### Files Modified

```
_To be filled after implementation_
```

---

## Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Developer | | | ⬜ |
| Reviewer | | | ⬜ |
