# Plan — Geo/Location Support

## Steps

**Step 1**: Add `listStates` and `listCities` to `GeoPlaceRepository`
**Step 2**: Implement `listStates` and `listCities` use cases + export them
**Step 3**: `GET /api/geo/states` route + `GET /api/geo/cities` route + Swagger → QA gate

## RBAC

Both endpoints are fully public — no auth, no RBAC.

## Error codes → HTTP

| Code | HTTP |
|---|---|
| (none — no errors beyond 400 for bad UUID) | 400 |
