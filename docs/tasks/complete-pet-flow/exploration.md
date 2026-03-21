# Exploration: Complete Pet Flow

**Date**: 2026-03-11
**Phase**: EXPLORATION
**Status**: COMPLETE

---

## Routes Inventory

### Existing Pet/Adoption Routes

| Method | Path | RBAC | Status |
|--------|------|------|--------|
| GET | `/api/pets` | Public | Done — filters: `cityPlaceId`, `species` |
| POST | `/api/workspaces/:id/pets` | OWNER/EDITOR | Done |
| PATCH | `/api/pets/:id` | OWNER/EDITOR | Done |
| POST | `/api/pets/:id/submit-for-review` | OWNER/EDITOR | Done |
| POST | `/api/pets/:id/images` | OWNER/EDITOR | Done |
| PATCH | `/api/pets/:id/images/:imageId` | OWNER/EDITOR | Done |
| DELETE | `/api/pets/:id/images/:imageId` | OWNER/EDITOR | Done |
| POST | `/api/pets/:id/interests` | GUARDIAN | Done |
| GET | `/api/workspaces/:id/interests` | OWNER/EDITOR/ADMIN | Done |
| POST | `/api/admin/pets/:id/approve` | SUPER_ADMIN/ADMIN | Done |
| POST | `/api/admin/pets/:id/reject` | SUPER_ADMIN/ADMIN | Done |
| POST | `/api/adoptions` | OWNER/EDITOR/ADMIN | Done |
| GET | `/api/adoptions/:id` | Guardian/Partner/Admin | Done |

### Missing Routes (Phase 1 scope)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/pets/:id` | Public pet detail |
| POST | `/api/pets/:id/requirements` | Add requirement |
| PATCH | `/api/pets/:id/requirements/:reqId` | Update requirement |
| DELETE | `/api/pets/:id/requirements/:reqId` | Remove requirement |
| GET | `/api/workspaces/:id/pets` | Partner pet management list |
| POST | `/api/pets/:id/track` | Metric event tracking |

---

## Prisma Models

### PetRequirement
```prisma
model PetRequirement {
  id          String                 @id @default(uuid())
  petId       String
  pet         Pet                    @relation(...)
  category    PetRequirementCategory // HOME, EXPERIENCE, TIME_AVAILABILITY, FINANCIAL, SAFETY, HEALTH_CARE, OTHER
  title       String
  description String?
  isMandatory Boolean                @default(true)
  order       Int
  createdAt   DateTime               @default(now())
  updatedAt   DateTime               @updatedAt

  @@unique([petId, order])
}
```

### PetMetricEvent
```prisma
model PetMetricEvent {
  id          String             @id @default(uuid())
  petId       String
  workspaceId String
  type        PetMetricEventType // VIEW_PET, CLICK_WHATSAPP, REGISTER_INTEREST
  createdAt   DateTime           @default(now())
}
```

### Pet Enums Available
- `PetSpecies`: DOG, CAT, RABBIT, BIRD, HORSE, COW, GOAT, PIG, TURTLE, OTHER
- `PetSex`: MALE, FEMALE
- `PetSize`: SMALL, MEDIUM, LARGE
- `PetAgeCategory`: PUPPY, YOUNG, ADULT, SENIOR
- `PetEnergyLevel`: LOW, MEDIUM, HIGH
- `PetIndependenceLevel`: LOW, MEDIUM, HIGH
- `PetEnvironment`: HOUSE, APARTMENT, BOTH
- `PetStatus`: DRAFT, PENDING_REVIEW, APPROVED, REJECTED, ADOPTED
- `PetRequirementCategory`: HOME, EXPERIENCE, TIME_AVAILABILITY, FINANCIAL, SAFETY, HEALTH_CARE, OTHER
- `PetMetricEventType`: VIEW_PET, CLICK_WHATSAPP, REGISTER_INTEREST

---

## Existing Use Cases

| File | Purpose |
|------|---------|
| `create-pet.use-case.ts` | Create pet in DRAFT |
| `update-pet.use-case.ts` | Update pet fields (DRAFT or PENDING_REVIEW) |
| `submit-pet-for-review.use-case.ts` | DRAFT → PENDING_REVIEW; validates images |
| `add-pet-image.use-case.ts` | Add image (max 5) |
| `update-pet-image.use-case.ts` | Update image position/cover |
| `remove-pet-image.use-case.ts` | Remove image |
| `list-pets.use-case.ts` | List public approved pets — delegates to repository |
| `admin/approve-pet-admin.use-case.ts` | Approve PENDING_REVIEW → APPROVED |
| `admin/reject-pet-admin.use-case.ts` | Reject PENDING_REVIEW → REJECTED |

---

## Existing Repository Methods (PetRepository)

```typescript
// Create
create(data)

// Read (internal)
findByIdWithWorkspace(id)
findByIdWithImagesAndWorkspace(id)
findByIdWithImagesAndWorkspaceForAdmin(id)

// Read (public)
listPublicPets(input: { cityPlaceId?, species?, page?, perPage? })
findByIdForInterest(id)
findByIdForAdoption(id)

// Write
update(id, data)
submitForReview(id, actorUserId)
approvePet(id, actorUserId)
rejectPet(id, actorUserId, reviewNote)

// Images
countImages(petId)
addPetImage(petId, data, actorUserId)
findImageByIdAndPetId(imageId, petId)
updatePetImage(imageId, petId, data, actorUserId)
deletePetImage(imageId, petId, actorUserId)
```

**New methods needed:**
- `findByIdPublic(id)` — full public view: all fields + images + requirements + workspace
- `listByWorkspace(workspaceId, opts)` — all statuses, paginated, status filter
- `addRequirement(petId, data)`
- `findRequirementById(reqId, petId)`
- `updateRequirement(reqId, petId, data)`
- `removeRequirement(reqId, petId)`
- `trackEvent(petId, workspaceId, type)`

---

## Key Patterns Confirmed

- All use cases return `{ success: true; data } | { success: false; code }`
- RBAC: workspace membership via `principal.memberships`
- Zod 4: use `z.uuid()`, `z.email()` (not `z.string().uuid()`)
- Route handlers: thin — validate → call use case → map codes to HTTP status
- Repositories: Prisma directly, no ORM abstraction layer
