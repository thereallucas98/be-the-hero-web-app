# Exploration — Campaign & Donation System

## Schema

### Campaign
- Status flow: DRAFT → PENDING_REVIEW → APPROVED | REJECTED; also CLOSED
- `petId` optional (campaign linked to a specific pet)
- `goalAmount` / `currentAmount` (Decimal 12,2)
- `approvedAt`, `approvedByUserId`
- `startsAt`, `endsAt` (optional, for future lifecycle management)

### CampaignDocument
- Types: MEDICAL_REPORT | COST_ESTIMATE | INVOICE | PHOTO_EVIDENCE | OTHER
- Status: PENDING_REVIEW | APPROVED | REJECTED (admin reviews docs separately from campaign)
- Fields: `fileUrl`, `storagePath`, `mimeType`, `fileSize`, `description`

### Donation
- `workspaceId` on donation = campaign's workspace (denormalized for querying)
- `paymentMethod`: PIX | TRANSFER | OTHER
- `proofUrl`, `storagePath`, `mimeType`, `fileSize` (proof of payment)
- `reviewNote` nullable (populated on rejection)
- On approval → increment `campaign.currentAmount`

## No Existing Repositories
No `campaign.repository.ts` or `donation.repository.ts` exists. Both must be created.

## Existing Patterns (from follow-up/adoption repos)

- Admin list methods accept `{ status?, page, perPage }` and return `{ items, total, page, perPage }`
- Approve/reject methods accept `(id, reviewedByUserId)` or include `reviewNote`
- Workspace RBAC: principal checks `memberships.find(m => m.workspaceId === id)`
- Admin RBAC: `principal.role === 'SUPER_ADMIN' || principal.role === 'ADMIN'`
- `Decimal` values from Prisma serialize as strings in JSON — route layer returns them as-is

## Workspace Repository
- `findByIdForInterestsAccess` already exists for checking workspace active/approved status
- Same method can be reused for campaign creation RBAC (workspace must be active + approved)

## Key Integration Points
- `campaignRepository` injected into use cases as parameter (same pattern)
- `workspaceRepository` reused to validate workspace status on create
- `petRepository` reused to validate petId exists (if provided) on create
- `auditRepository` — not used in this feature (no audit log requirement for campaigns)
