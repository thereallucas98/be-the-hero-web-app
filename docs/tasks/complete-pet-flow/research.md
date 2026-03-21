# Research: Complete Pet Flow

**Date**: 2026-03-11
**Phase**: RESEARCH
**Status**: COMPLETE

---

## Open Question 1 — Public Pet Detail Auth Requirement

**Question**: Should `GET /api/pets/:id` require authentication?

**Decision**: **No auth required.** Anyone can view a public pet detail.

**Rationale**: This is the public adoption platform. Guardians need to see pet details before creating an account. Same model as listing (`GET /api/pets` is already public).

**Safety**: Return 404 for any pet that is not in APPROVED status. This prevents status enumeration — a caller cannot determine whether a DRAFT/REJECTED pet exists at all.

---

## Open Question 2 — Requirement Order Management

**Question**: How to handle `@@unique([petId, order])` when adding a requirement with a conflicting order value?

**Decision**: **Return 409 with `ORDER_CONFLICT`**. Callers manage order explicitly — no auto-shifting.

**Rationale**: Auto-shifting would require a transaction that updates multiple rows (complex, risky for concurrent requests). Explicit order management is simple and gives the client full control (e.g., drag-to-reorder in UI). The client should read current requirements, pick a non-conflicting order value, then POST.

**Implementation**: Catch `PrismaClientKnownRequestError` with code `P2002` from `addRequirement` → return `ORDER_CONFLICT`.

---

## Open Question 3 — Metric Tracking Auth

**Question**: Should `POST /api/pets/:id/track` require authentication?

**Decision**: **No auth required.** Anonymous tracking.

**Rationale**: VIEW_PET and CLICK_WHATSAPP are passive engagement signals — requiring auth would significantly reduce tracking coverage since most visitors are not logged in. The data is used for funnel analytics only, not for user-specific features.

**Note**: `REGISTER_INTEREST` events are already implicitly tracked when a guardian calls `POST /api/pets/:id/interests`, so the track endpoint is primarily for VIEW_PET and CLICK_WHATSAPP.

**Implementation**: No `getPrincipal` call in the route. Get `workspaceId` from the pet record itself (look up pet → read `pet.workspaceId`).

---

## Open Question 4 — Partner Pet List RBAC

**Question**: Which workspace roles can see `GET /api/workspaces/:id/pets`?

**Decision**: **All workspace members** (OWNER, EDITOR, FINANCIAL) can list pets. SUPER_ADMIN and ADMIN can view any workspace.

**Rationale**: FINANCIAL members may need to see the pet inventory for reporting. No sensitive data is exposed. The internal list (all statuses) is still scoped to the workspace.

---

## Open Question 5 — Enhanced Filters Validation

**Question**: Should unknown enum values in filters return 400 or silently be ignored?

**Decision**: **Return 400 with details** if the value is not a valid enum member.

**Rationale**: Consistent with how the existing Zod validation works throughout the codebase. Use `z.enum([...]).optional()` for each new filter param.

---

## Decision Log

| # | Decision | Choice |
|---|----------|--------|
| 1 | Public pet detail auth | No auth; 404 for non-APPROVED |
| 2 | Requirement order conflicts | 409 ORDER_CONFLICT; caller manages order |
| 3 | Metric tracking auth | No auth; workspaceId from pet record |
| 4 | Partner pet list RBAC | All workspace members + admin |
| 5 | Invalid enum filter values | Return 400 |

---

## Confirmed: New Schemas

```typescript
// server/schemas/pet.schema.ts

AddPetRequirementSchema = z.object({
  category: z.enum(['HOME', 'EXPERIENCE', 'TIME_AVAILABILITY', 'FINANCIAL', 'SAFETY', 'HEALTH_CARE', 'OTHER']),
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  isMandatory: z.boolean().default(true),
  order: z.number().int().min(1),
}).strict()

UpdatePetRequirementSchema = z.object({
  category: z.enum([...]).optional(),
  title: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  isMandatory: z.boolean().optional(),
  order: z.number().int().min(1).optional(),
}).strict()

TrackPetEventSchema = z.object({
  type: z.enum(['VIEW_PET', 'CLICK_WHATSAPP', 'REGISTER_INTEREST']),
}).strict()

ListWorkspacePetsQuerySchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ADOPTED']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(50).optional().default(20),
})

// Extended existing list query:
ListPetsQuerySchema = z.object({
  cityPlaceId: z.uuid().optional(),
  species: z.enum([...]).optional(),
  sex: z.enum(['MALE', 'FEMALE']).optional(),           // NEW
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE']).optional(), // NEW
  ageCategory: z.enum([...]).optional(),                 // NEW
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(20).optional().default(20),
})
```

---

## Confirmed: New Repository Methods

```typescript
// findByIdPublic — full public view
findByIdPublic(id: string): Promise<PublicPetDetailItem | null>
// Returns: id, name, description, species, sex, size, ageCategory,
//          energyLevel, independenceLevel, environment, adoptionRequirements,
//          images (sorted by position), requirements (sorted by order),
//          workspace: { id, name }
// Condition: status === APPROVED && isActive === true

// listByWorkspace — internal partner view (all statuses)
listByWorkspace(workspaceId: string, opts: {
  status?: string,
  page: number,
  perPage: number,
}): Promise<{ items: WorkspacePetListItem[]; total: number; page: number; perPage: number }>

// Requirements CRUD
addRequirement(petId: string, data: AddRequirementData): Promise<PetRequirementItem>
findRequirementById(reqId: string, petId: string): Promise<PetRequirementItem | null>
updateRequirement(reqId: string, petId: string, data: UpdateRequirementData): Promise<PetRequirementItem | null>
removeRequirement(reqId: string, petId: string): Promise<boolean>

// Metric tracking
trackEvent(petId: string, workspaceId: string, type: string): Promise<void>
```

No Prisma schema migration required.
