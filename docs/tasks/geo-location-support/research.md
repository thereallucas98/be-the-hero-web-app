# Research — Geo/Location Support

## Decisions

**Query param validation**: Use `z.uuid().optional()` for `countryId` / `stateId`. Invalid UUID → 400 with `details`. Missing → no filter applied.

**Return shape**:
- States: `{ id, name, code, slug }[]` — include `code` (e.g. "PB", "SP") for display
- Cities: `{ id, name, slug }[]` — `code` not meaningful at city level

**No pagination**: Geo lists are small reference data. Return all matching records.

**No use-case business logic**: Just pass through to repo. Use case exists only for consistency with arch pattern.

**Empty = 200 + `[]`**: Unknown filter ID → empty array, not 404.

## Edge Cases

| Case | Handling |
|---|---|
| `stateId` not a UUID | 400 with details |
| `stateId` valid UUID but no cities found | 200 `[]` |
| No query param | return all states / all cities |
| DB has no data seeded | 200 `[]` |
