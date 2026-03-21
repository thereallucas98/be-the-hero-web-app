# Exploration — Geo/Location Support

## GeoPlace Schema

```prisma
enum GeoPlaceType { COUNTRY, STATE, CITY }

model GeoPlace {
  id        String        @id @default(uuid())
  type      GeoPlaceType
  name      String
  code      String?
  slug      String        @unique
  parentId  String?
  parent    GeoPlace?     @relation("GeoPlaceParent", ...)
  children  GeoPlace[]    @relation("GeoPlaceParent")
  updatedAt DateTime      @updatedAt
  @@index([type])
  @@index([parentId])
  @@map("geo_place")
}
```

Hierarchy: COUNTRY → STATE → CITY via `parentId`.

## Existing Repository

`geo-place.repository.ts` — only `findCityById(id)`. No list methods.

## How GeoPlace Is Used

- `PartnerWorkspaceLocation.cityPlaceId` → FK to a CITY
- `PartnerCityCoverage.cityPlaceId` → FK to a CITY
- `AdminCoverage.cityPlaceId` → FK to a CITY

All consumers need a city ID. States are needed only to filter the city dropdown.

## Existing Patterns (from other routes)

- Public list endpoints (e.g., `GET /api/pets`) use no auth, parse query params with Zod, call use case, return JSON
- Query param validation uses `z.uuid().optional()` for optional UUID filters
- No pagination needed for small reference lists

## Key Findings

- No geo routes exist at all — `app/api/geo/` directory doesn't exist
- No geo use cases exist
- Repository needs 2 new methods: `listStates(countryId?)` and `listCities(stateId?)`
- Both endpoints are fully public (no auth, no RBAC)
- Return shape: states → `{ id, name, code, slug }[]`, cities → `{ id, name, slug }[]`
