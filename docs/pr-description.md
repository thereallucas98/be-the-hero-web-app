## Description

### feat: workspace member role update, city coverage CRUD, workspace deactivation

Implements sub-steps 0.4–0.6 of Phase 0 — workspace owners can update member roles, manage city coverage, and deactivate a workspace.

---

### What changed

| File | Change |
|------|--------|
| `server/repositories/workspace.repository.ts` | Added `updateMemberRole`, `listCityCoverage`, `addCityCoverage`, `removeCityCoverage`, `deactivateWorkspace` |
| `server/schemas/workspace.schema.ts` | New — `UpdateMemberRoleSchema`, `AddCityCoverageSchema` |
| `server/use-cases/workspaces/update-workspace-member-role.use-case.ts` | New — OWNER-only role update, blocks demoting last OWNER |
| `server/use-cases/workspaces/list-city-coverage.use-case.ts` | New — any member can list coverage |
| `server/use-cases/workspaces/add-city-coverage.use-case.ts` | New — OWNER-only, validates CITY type, handles duplicate |
| `server/use-cases/workspaces/remove-city-coverage.use-case.ts` | New — OWNER-only removal |
| `server/use-cases/workspaces/deactivate-workspace.use-case.ts` | New — OWNER or ADMIN can deactivate, sets isActive=false |
| `server/use-cases/index.ts` | Exported all new use cases with types |
| `app/api/workspaces/[id]/members/[memberId]/route.ts` | Added PATCH handler |
| `app/api/workspaces/[id]/city-coverage/route.ts` | New — GET + POST handlers |
| `app/api/workspaces/[id]/city-coverage/[coverageId]/route.ts` | New — DELETE handler |
| `app/api/workspaces/[id]/route.ts` | Added DELETE handler |
