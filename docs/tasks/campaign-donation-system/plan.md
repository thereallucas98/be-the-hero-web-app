# Plan — Campaign & Donation System

## Steps

**Step 1**: `CampaignRepository` (interface + impl) + `createCampaign` use case + schemas + `POST /workspaces/:id/campaigns`
→ QA gate A

**Step 2**: `listWorkspaceCampaigns` + `GET /workspaces/:id/campaigns` + `getCampaignById` + `GET /campaigns/:id`
→ QA gate B

**Step 3**: `updateCampaign` + `PATCH /campaigns/:id` + `submitCampaignForReview` + `POST /campaigns/:id/submit-for-review`
→ QA gate C

**Step 4**: `CampaignDocumentRepository` + `addCampaignDocument` + `removeCampaignDocument` + document routes
→ QA gate D

**Step 5**: `listAdminCampaigns` + `approveCampaign` + `rejectCampaign` + admin campaign routes
→ QA gate E

**Step 6**: `DonationRepository` + `registerDonation` + `listCampaignDonations` + donation schemas + donation routes
→ QA gate F

**Step 7**: `listAdminDonations` + `approveDonation` (with currentAmount increment) + `rejectDonation` + admin donation routes
→ QA gate G

**Step 8**: Swagger docs (`campaigns.ts`, `donations.ts`) + export use cases from `index.ts` + `pnpm lint` + `pnpm build` + update roadmap
→ Final gate

## Repository Methods Summary

### CampaignRepository
- `create(data)` → `CampaignItem`
- `findById(id)` → `CampaignDetailItem | null` (includes documents, workspace info)
- `findByIdForMember(id, workspaceId)` → `CampaignItem | null`
- `listByWorkspace(workspaceId, { status?, page, perPage })` → paginated
- `listForAdmin({ status?, workspaceId?, page, perPage })` → paginated (admin view)
- `update(id, data)` → `CampaignItem`
- `submitForReview(id)` → sets status = PENDING_REVIEW
- `approve(id, approvedByUserId)` → sets status = APPROVED, approvedAt
- `reject(id)` → sets status = REJECTED
- `countDocuments(id)` → number (for submit-for-review gate)

### CampaignDocumentRepository
- `create(data)` → `CampaignDocumentItem`
- `findById(id)` → `CampaignDocumentItem | null`
- `delete(id)` → void

### DonationRepository
- `create(data)` → `DonationItem`
- `listByCampaign(campaignId, { page, perPage })` → paginated public view
- `listForAdmin({ status?, campaignId?, page, perPage })` → paginated admin view
- `findById(id)` → `DonationAdminItem | null`
- `approve(id, reviewedByUserId)` → sets status = APPROVED; increments campaign.currentAmount (transaction)
- `reject(id, reviewedByUserId, reviewNote)` → sets status = REJECTED
