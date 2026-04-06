# Research — F5.7 + F5.8

## Decision 1 — Coverage: simple list + add form

No complex UI needed. List current cities with remove button. Add form with state→city cascade (reuse the geo APIs). For MVP, admin adds coverage for themselves (SUPER_ADMIN can target other admins later via a user selector).

## Decision 2 — Audit logs: filterable table with selects

Dropdowns for entityType and action. Date inputs for dateFrom/dateTo. Table rows showing timestamp, actor, action, entity type, entity ID. Pagination.

## Decision 3 — Data fetching: React Query + REST

Same pattern as all admin pages.
