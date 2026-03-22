# Exploration — Analytics & Metrics (Phase 6)

## Data sources available

### PetMetricEvent
- Fields: id, petId, workspaceId, type (VIEW_PET | CLICK_WHATSAPP | REGISTER_INTEREST), createdAt
- Indexes: petId, workspaceId, type, createdAt
- Used by: `trackEvent` in pet.repository.ts

### Pet
- Counts by workspaceId + status available via Prisma count/groupBy
- Status enum: DRAFT, PENDING_REVIEW, APPROVED, REJECTED, ADOPTED

### Donation
- Has: amount (Decimal), status (PENDING_REVIEW | APPROVED | REJECTED), workspaceId, campaignId
- Raised total = sum(amount) where status=APPROVED

### Campaign
- Has: status, workspaceId, currentAmount (Decimal, maintained by donation approval)
- Status enum: DRAFT, PENDING_DOCUMENTS, PENDING_REVIEW, APPROVED, REJECTED, CLOSED

### Adoption
- Has: workspaceId, status (ACTIVE | COMPLETED | ARCHIVED), petId (unique)

### PartnerWorkspace
- Has: isActive, verificationStatus, locations (→ cityPlaceId)

## Existing repository methods relevant to metrics

- `pet.repository.ts`: no aggregation methods yet
- `workspace.repository.ts`: no aggregation methods yet
- `donation.repository.ts`: approve() uses `{ increment: Number(d.amount) }` for currentAmount
- `adoption.repository.ts`: no count/aggregate methods

## RBAC constraints

- Per-workspace metrics (6.1): workspace OWNER, EDITOR, or ADMIN
  - `findByIdWithDetails` already checks membership
  - Need to check if user is workspace member with appropriate role
- Platform metrics (6.2): ADMIN or SUPER_ADMIN
  - ADMIN: should be scoped to covered cities (adminCities) — or show all? → roadmap says "Filters: cityId" which suggests caller supplies it
