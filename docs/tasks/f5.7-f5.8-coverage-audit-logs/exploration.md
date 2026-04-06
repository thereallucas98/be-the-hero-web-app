# Exploration — F5.7 + F5.8

## F5.7 Coverage

- `GET /api/admin/coverage` → returns `AdminCoverageItem[]` (not paginated, plain array)
- `POST /api/admin/coverage` → body `{ adminUserId, cityId }` → SUPER_ADMIN only
- `DELETE /api/admin/coverage/:id` → SUPER_ADMIN only
- ADMIN sees own coverage only; SUPER_ADMIN can filter by `adminUserId`
- Need city selector (state → city cascade) for adding coverage

## F5.8 Audit Logs

- `GET /api/admin/audit-logs` → `{ items, total, page, perPage }` — SUPER_ADMIN only
- Filters: `actorId`, `entityType`, `action`, `dateFrom`, `dateTo`
- Entity types: PET, WORKSPACE, CAMPAIGN, DONATION, ADOPTION, ADOPTION_INTEREST, etc.
- Actions: CREATE, UPDATE, DELETE, APPROVE, REJECT, etc.
