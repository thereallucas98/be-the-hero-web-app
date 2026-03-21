# Validation — Geo/Location Support

## Acceptance Criteria

| # | Criterion | Method | Result |
|---|---|---|---|
| 1 | `GET /api/geo/states` returns array | curl | 🔲 |
| 2 | `GET /api/geo/states?countryId=<uuid>` filters by country | curl | 🔲 |
| 3 | `GET /api/geo/states?countryId=not-a-uuid` → 400 | curl | 🔲 |
| 4 | `GET /api/geo/cities` returns array | curl | 🔲 |
| 5 | `GET /api/geo/cities?stateId=<uuid>` filters by state | curl | 🔲 |
| 6 | `GET /api/geo/cities?stateId=not-a-uuid` → 400 | curl | 🔲 |
| 7 | Both endpoints require no auth (no cookie needed) | curl | 🔲 |
| 8 | Swagger docs visible at /api-docs | manual | 🔲 |
| 9 | `pnpm lint` passes | shell | 🔲 |
| 10 | `pnpm build` passes | shell | 🔲 |
