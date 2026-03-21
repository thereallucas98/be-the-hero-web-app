# Task Brief: Admin Tools (Phase 5)

**Created**: 2026-03-21
**Status**: In Progress
**Complexity**: Medium
**Type**: New Feature

---

## Feature Overview

### User Story
As a SUPER_ADMIN, I want to assign city coverage to admins, verify partner workspaces, and query the audit trail so that the platform can scale with proper delegation and governance.

### Scope

**In Scope:**
- Admin coverage CRUD (list own coverage, assign/remove by SUPER_ADMIN)
- Workspace verification (list, approve, reject with reviewNote)
- Audit log listing with filters (SUPER_ADMIN)

**Out of Scope:**
- Audit log writes in new endpoints (existing flows not retroactively instrumented)
- Admin self-service coverage management

---

## Current State

**Key Files:**
- `prisma/schema.prisma` — AdminCoverage, PartnerWorkspace, AuditLog models exist
- `src/server/repositories/workspace.repository.ts` — no approve/reject methods
- `src/server/repositories/audit.repository.ts` — write-only (no listLogs)
- `src/app/api/admin/` — pets, campaigns, donations, follow-up-submissions covered; workspaces, coverage, audit-logs missing

**Gaps:**
- No AdminCoverageRepository
- No workspace verification use cases or routes
- PartnerWorkspace has no `reviewNote` field (migration needed)
- AuditRepository has no read methods

---

## Files to Change

### New Files
- `src/server/repositories/admin-coverage.repository.ts`
- `src/server/use-cases/admin/list-admin-coverage.use-case.ts`
- `src/server/use-cases/admin/add-admin-coverage.use-case.ts`
- `src/server/use-cases/admin/remove-admin-coverage.use-case.ts`
- `src/server/use-cases/admin/list-admin-workspaces.use-case.ts`
- `src/server/use-cases/admin/approve-workspace.use-case.ts`
- `src/server/use-cases/admin/reject-workspace.use-case.ts`
- `src/server/use-cases/admin/list-audit-logs.use-case.ts`
- `src/server/schemas/admin.schema.ts`
- `src/app/api/admin/coverage/route.ts`
- `src/app/api/admin/coverage/[id]/route.ts`
- `src/app/api/admin/workspaces/route.ts`
- `src/app/api/admin/workspaces/[id]/approve/route.ts`
- `src/app/api/admin/workspaces/[id]/reject/route.ts`
- `src/app/api/admin/audit-logs/route.ts`
- `src/lib/swagger/definitions/admin-tools.ts`

### Modified Files
- `prisma/schema.prisma` — add `reviewNote String?` to PartnerWorkspace
- `src/server/repositories/workspace.repository.ts` — add listForAdmin, approveWorkspace, rejectWorkspace
- `src/server/repositories/audit.repository.ts` — add listLogs method
- `src/server/repositories/index.ts` — export adminCoverageRepository
- `src/server/use-cases/index.ts` — export new use cases
