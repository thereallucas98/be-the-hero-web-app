# Task Brief — F5.7 + F5.8: Coverage Management + Audit Logs

## F5.7 — Admin Coverage Management

> As a SUPER_ADMIN, I want to manage which cities each ADMIN covers.

- List current coverage (cities assigned to the logged-in admin, or filter by adminUserId for SUPER_ADMIN)
- Add city coverage (SUPER_ADMIN only): select admin user + city
- Remove city coverage (SUPER_ADMIN only)
- APIs: `GET /api/admin/coverage`, `POST /api/admin/coverage`, `DELETE /api/admin/coverage/:id`

## F5.8 — Audit Log Viewer

> As a SUPER_ADMIN, I want to view a filterable audit log of all platform actions.

- Filterable table: by entityType, action, date range
- Paginated
- API: `GET /api/admin/audit-logs` (SUPER_ADMIN only)

## Acceptance criteria

- [ ] Coverage page lists cities, add/remove works (SUPER_ADMIN)
- [ ] Audit logs page shows filterable, paginated table
- [ ] `pnpm lint` passes, `pnpm build` succeeds
