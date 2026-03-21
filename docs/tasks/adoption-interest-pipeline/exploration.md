# Exploration: Adoption Interest Pipeline

**Date**: 2026-03-21
**Phase**: EXPLORATION
**Status**: Complete

---

## Current Implementation Overview

### What exists

Two endpoints are already live:

| Route | File | Status |
|---|---|---|
| `POST /api/pets/:id/interests` | `app/api/pets/[id]/interests/route.ts` | ✅ done |
| `GET /api/workspaces/:id/interests` | `app/api/workspaces/[id]/interests/route.ts` | ✅ done |

### AdoptionInterest model (Prisma)

```
AdoptionInterest {
  id          String
  userId      String   ← guardian's userId
  petId       String
  workspaceId String
  message     String?
  channel     AdoptionInterestChannel  @default(WHATSAPP)
  createdAt   DateTime
}
```

No `status` field — interests are ephemeral.

---

## Key Files and Functions

### Repository — `adoption-interest.repository.ts`

**Current interface:**
```typescript
create(data, actorUserId): Promise<CreatedAdoptionInterestItem>
listByWorkspace(input: { workspaceId, page, perPage }): Promise<ListByWorkspaceResult>
```

**Missing methods needed:**
- `findById(id)` → bare interest for ownership checks
- `findByUserId(userId, { page, perPage })` → guardian's own paginated list (with pet summary)
- `findByIdForWorkspace(id, workspaceId)` → interest scoped to workspace (for workspace actions)
- `deleteById(id)` → generic delete

### Repository — `pet.repository.ts`

- `findByIdForAdoption(id)` → returns `{ workspaceId, status, workspace: { isActive, verificationStatus }, hasAdoption }` — reusable for convert validation
- `findByIdForInterest(id)` → used by `registerAdoptionInterest` — similar shape

### Repository — `adoption.repository.ts`

- `create(data: CreateAdoptionData)` → full transaction: creates Adoption + sets pet to ADOPTED + creates 3 AdoptionFollowUps + 2 AuditLogs
- `CreateAdoptionData` = `{ petId, guardianUserId, workspaceId, adoptedAt, notes?, createdByUserId }`

### Repository — `workspace.repository.ts`

- `findByIdForInterestsAccess(id)` → returns `WorkspaceForInterestsAccessItem { id, workspaceCityIds }` — used for RBAC in `listWorkspaceInterests` and `registerAdoption`

### Use Cases (existing)

- `register-adoption-interest.use-case.ts` — validates pet is APPROVED+active, workspace is active+approved, calls `adoptionInterestRepo.create`. RBAC: role must be GUARDIAN.
- `list-workspace-interests.use-case.ts` — RBAC: workspace OWNER/EDITOR or ADMIN with city coverage. Calls `adoptionInterestRepo.listByWorkspace`.
- `register-adoption.use-case.ts` — takes `{ petId, guardianUserId, adoptedAt?, notes? }`. Does full RBAC + pet validation + calls `adoptionRepo.create`. **Not reused for convert** because: (a) it requires `guardianUserId` as explicit input rather than taking it from the interest, (b) RBAC check re-fetches workspace separately.

### Schemas

- `RegisterAdoptionInterestSchema` in `pet.schema.ts` — `{ message? }`, strict
- `ListWorkspaceInterestsQuerySchema` in `workspace.schema.ts` — `{ page, perPage }`
- No schema yet for convert or list-my-interests

---

## Integration Points

1. **Convert interest → adoption**: calls `petRepo.findByIdForAdoption` + `workspaceRepo.findByIdForInterestsAccess` + `adoptionRepo.create` + `adoptionInterestRepo.deleteById`
2. **Routes are nested** under existing `[id]` dynamic segments — new `[interestId]` subdirectory needed under `pets/[id]/interests/` and `workspaces/[id]/interests/`
3. **`adoptionRepo.create` already handles**: pet ADOPTED status update, 3 follow-up creation, audit logs — no extra logic needed in the convert use case

---

## Potential Risks

| Risk | Notes |
|---|---|
| Race condition on convert | If two workspace members convert the same interest simultaneously, `adoptionRepo.create` hits the pet's unique `adoption` relation → Prisma P2002 unique constraint violation → catch and map to `PET_ALREADY_ADOPTED` |
| Interest belongs to wrong workspace | `findByIdForWorkspace(id, workspaceId)` scopes query to prevent cross-workspace access |
| Guardian withdraws after workspace converts | Same DELETE race: interest is gone → 404, no harm done |

---

## Open Questions

None — scope is clear from brief.
