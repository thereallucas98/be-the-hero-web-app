# Research: Adoption Interest Pipeline

**Date**: 2026-03-21
**Phase**: RESEARCH
**Status**: Complete

---

## Recommended Approach

Same established pattern: thin routes → use cases → repository. Extend the existing `AdoptionInterestRepository` with 4 new methods. 4 new use cases under `adoption-interests/`. 4 new route handlers.

---

## Key Decisions

### 1. Interests are deleted on all terminal actions (no status field)

No DB migration needed. `AdoptionInterest` has no `status` column; interests are ephemeral. Withdraw, dismiss, and convert all call `adoptionInterestRepo.deleteById(id)`.

**Alternative considered**: Add a `status` enum (`PENDING | WITHDRAWN | DISMISSED | CONVERTED`). Rejected — adds a migration and query complexity for no user-facing benefit. The system doesn't need to show historical interest state.

---

### 2. Convert use case calls repos directly, does not reuse `registerAdoption`

`registerAdoption` takes `guardianUserId` as explicit caller-supplied input and re-fetches workspace RBAC. For convert, the `guardianUserId` comes from the interest record itself, and workspace RBAC is already checked by the workspace path param. Calling `adoptionRepo.create()` directly is simpler and avoids double-fetching.

Validation still needed before `adoptionRepo.create`:
- Pet still APPROVED (status could have changed since interest was filed) → `petRepo.findByIdForAdoption`
- Pet not already adopted → `hasAdoption` flag from above
- Workspace still active → `workspaceRepo.findByIdForInterestsAccess`

---

### 3. Convert schema — `ConvertInterestSchema`

Add to `adoption-interest.schema.ts` (new file, consistent with pattern):

```typescript
ConvertInterestSchema = z.object({
  notes: z.string().max(1000).optional(),
  adoptedAt: z.string().datetime().optional(),
}).strict()
```

`guardianUserId` is taken from the interest record — caller does not supply it.

---

### 4. List my interests schema — `ListMyInterestsQuerySchema`

```typescript
ListMyInterestsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(20).optional().default(10),
})
```

---

### 5. New repository methods

```typescript
findById(id: string): Promise<InterestItem | null>
  // returns { id, userId, petId, workspaceId } — for ownership check

findByIdForWorkspace(id: string, workspaceId: string): Promise<InterestForWorkspaceItem | null>
  // WHERE id = $id AND workspaceId = $workspaceId
  // returns { id, userId, petId, workspaceId } — for workspace actions

findByUserId(userId: string, input: { page, perPage }): Promise<ListMyInterestsResult>
  // paginated, includes pet summary (id, name, species, sex, size, ageCategory, coverImage)

deleteById(id: string): Promise<void>
```

---

### 6. RBAC per use case

| Use Case | Guard |
|---|---|
| `listMyInterests` | `principal` must exist (any role) |
| `withdrawAdoptionInterest` | `principal.userId === interest.userId` |
| `convertInterestToAdoption` | workspace OWNER/EDITOR (same check as `listWorkspaceInterests`) |
| `dismissAdoptionInterest` | workspace OWNER/EDITOR |

---

### 7. P2002 race condition on convert

If two converts race, `adoptionRepo.create` hits the unique `adoption.petId` constraint (one pet → one adoption). Catch `Prisma.PrismaClientKnownRequestError` with `code === 'P2002'` in the use case and return `{ success: false, code: 'PET_ALREADY_ADOPTED' }`. Pattern matches how other use cases handle it.

---

## Edge Cases

| Case | Code | HTTP |
|---|---|---|
| Interest not found | `NOT_FOUND` | 404 |
| Guardian tries to withdraw another user's interest | `FORBIDDEN` | 403 |
| Workspace tries to act on interest from different workspace | `NOT_FOUND` | 404 (scoped query returns null) |
| Pet already adopted when convert runs | `PET_ALREADY_ADOPTED` | 409 |
| Pet no longer APPROVED when convert runs | `PET_NOT_APPROVED` | 409 |
| Workspace inactive when convert runs | `WORKSPACE_BLOCKED` | 409 |
| Unauthenticated | `UNAUTHENTICATED` | 401 |
| Not workspace OWNER/EDITOR | `FORBIDDEN` | 403 |
| Bad UUID in path | — | 400 + details |

---

## Decision Log

| # | Decision | Rationale |
|---|---|---|
| 1 | Delete on terminal action, no status field | No migration; interests are ephemeral |
| 2 | Convert calls repos directly | Avoids duplicate RBAC fetch; `guardianUserId` from interest |
| 3 | New `adoption-interest.schema.ts` | Consistent with `follow-up.schema.ts` pattern for new domains |
| 4 | `findByIdForWorkspace` scopes by workspaceId | Prevents cross-workspace access without a separate RBAC check |
| 5 | Catch P2002 in convert use case | Matches existing pattern for race conditions |
