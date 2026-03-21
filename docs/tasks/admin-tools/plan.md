# Plan — Admin Tools (Phase 5)

**Date**: 2026-03-21

---

## Step 1 — Admin Coverage CRUD → QA gate A

- AdminCoverageRepository: `listByAdmin(adminUserId)`, `create(adminUserId, cityPlaceId)`, `findById(id)`, `delete(id)`, `exists(adminUserId, cityPlaceId)`
- Use cases: `listAdminCoverage` (ADMIN sees own; SUPER_ADMIN can filter by adminUserId), `addAdminCoverage` (SUPER_ADMIN only), `removeAdminCoverage` (SUPER_ADMIN only)
- Schema: `AddAdminCoverageSchema` — `{ adminUserId: uuid, cityId: uuid }`
- Routes: `GET /api/admin/coverage`, `POST /api/admin/coverage`, `DELETE /api/admin/coverage/:id`
- QA: happy paths + 401/403/404/409 (duplicate coverage)

## Step 2 — Workspace Verification → QA gate B

- Migration: add `reviewNote String?` to PartnerWorkspace
- WorkspaceRepository: add `listForAdmin(input)`, `approveWorkspace(id, approvedByUserId)`, `rejectWorkspace(id, reviewNote)`
- Use cases: `listAdminWorkspaces`, `approveWorkspace`, `rejectWorkspace`
- Schema: `ListAdminWorkspacesQuerySchema`, `RejectWorkspaceSchema`
- Routes: `GET /api/admin/workspaces`, `POST /api/admin/workspaces/:id/approve`, `POST /api/admin/workspaces/:id/reject`
- QA: happy paths + 401/403/404/409 (wrong verificationStatus)

## Step 3 — Audit Logs → QA gate C

- AuditRepository: add `listLogs(input)` — filters: actorId, entityType, action, dateFrom, dateTo, pagination
- Use case: `listAuditLogs` (SUPER_ADMIN only)
- Schema: `ListAuditLogsQuerySchema`
- Route: `GET /api/admin/audit-logs`
- QA: happy paths + 401/403 + filter combinations

## Step 4 — Swagger + Lint + Build + Roadmap → Final gate

- `src/lib/swagger/definitions/admin-tools.ts` (coverage, workspace, audit-log endpoints)
- Add tags to `src/lib/swagger.ts`
- `pnpm lint` → 0 warnings
- `pnpm build` → success
- Mark Phase 5 ✅ in `docs/API-ROADMAP.md`
