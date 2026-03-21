# Task Brief: Geo/Location Support

**Created**: 2026-03-21
**Status**: In Progress
**Complexity**: Simple
**Type**: API Endpoint
**Estimated Effort**: 1–2 hours

---

## Feature Overview

### User Story
As a client (frontend, mobile, or guardian), I want to list available states and cities so that I can populate location dropdowns in workspace creation, pet listing filters, and admin coverage assignment.

### Problem Statement
The `GeoPlace` table already contains geographic hierarchy (COUNTRY → STATE → CITY) and is referenced by workspaces, city coverage, and admin coverage — but there are no public routes to query it. Clients have no way to populate location pickers without hardcoding data.

### Scope

**In Scope:**
- `GET /api/geo/states` — list all states (optionally filtered by `countryId`)
- `GET /api/geo/cities` — list cities filtered by `stateId`
- Swagger docs for both endpoints

**Out of Scope:**
- Countries endpoint (not needed for pilot scope — Brazil only)
- Creating or updating geo places (seeded data, managed outside API)
- Pagination (geo lists are small enough to return all at once)

---

## Current State

**Key Files:**
- `apps/web/prisma/schema.prisma` — `GeoPlace` model with `type` (COUNTRY/STATE/CITY), `name`, `code`, `slug`, `parentId`
- `apps/web/src/server/repositories/geo-place.repository.ts` — existing repo with only `findCityById` method
- `apps/web/src/server/repositories/index.ts` — exports `geoPlaceRepository`

**Current Behavior:**
`GeoPlace` is used internally for FK references (workspace location, city coverage, admin coverage) but has no read endpoints.

**Gaps/Issues:**
- No `GET /api/geo/states` route
- No `GET /api/geo/cities` route
- `GeoPlaceRepository` only has `findCityById` — needs `listStates` and `listCities` methods

---

## Requirements

### Functional Requirements

**FR1: List States**
- **Trigger**: `GET /api/geo/states?countryId=<uuid>` (countryId optional)
- **Expected Outcome**: Returns array of `{ id, name, code, slug }` for all STATE-type geo places
- **Edge Cases**: No states seeded → empty array (not 404)

**FR2: List Cities**
- **Trigger**: `GET /api/geo/cities?stateId=<uuid>` (stateId optional but practically always provided)
- **Expected Outcome**: Returns array of `{ id, name, slug }` for all CITY-type geo places, optionally filtered by parent stateId
- **Edge Cases**: Unknown stateId → empty array (not 404); no stateId → all cities

---

## Technical Approach

**Chosen Approach:**
- Add `listStates(countryId?)` and `listCities(stateId?)` to `GeoPlaceRepository`
- Thin use-case layer (validation only — no RBAC, public endpoints)
- Routes at `app/api/geo/states/route.ts` and `app/api/geo/cities/route.ts`
- No auth required on either endpoint

**Rationale:**
Consistent with existing pattern. Geo data is reference data — no business logic needed beyond simple Prisma queries filtered by `type` and optionally `parentId`.

---

## Files to Change

### New Files
- [ ] `apps/web/src/app/api/geo/states/route.ts`
- [ ] `apps/web/src/app/api/geo/cities/route.ts`
- [ ] `apps/web/src/server/use-cases/geo/list-states.use-case.ts`
- [ ] `apps/web/src/server/use-cases/geo/list-cities.use-case.ts`
- [ ] `apps/web/src/lib/swagger/definitions/geo.ts`

### Modified Files
- [ ] `apps/web/src/server/repositories/geo-place.repository.ts` — add `listStates`, `listCities`
- [ ] `apps/web/src/server/use-cases/index.ts` — export new use cases

---

## Acceptance Criteria

### Must Have (P0)
- [ ] `GET /api/geo/states` returns all states as `[{ id, name, code, slug }]`
- [ ] `GET /api/geo/states?countryId=<uuid>` filters by parent country
- [ ] `GET /api/geo/cities` returns all cities as `[{ id, name, slug }]`
- [ ] `GET /api/geo/cities?stateId=<uuid>` filters by parent state
- [ ] Both endpoints require no auth
- [ ] Invalid UUID for `countryId`/`stateId` returns 400
- [ ] Swagger docs added for both endpoints

---

## Dependencies

**Blocks:** Phase 4 (Campaigns) depends on geo for city filtering
**Blocked By:** None
**Related Work:** Phase 0.5 city coverage (done), Phase 5.1 admin coverage

---

## Complexity Estimate

**Overall**: Simple
- Backend: Simple (2 queries, no RBAC, no business logic)
- Frontend: None

**Estimated Effort**: 1–2 hours
**Confidence**: High
