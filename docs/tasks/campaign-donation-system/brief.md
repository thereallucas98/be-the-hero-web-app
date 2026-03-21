# Task Brief: Campaign & Donation System

**Created**: 2026-03-21
**Status**: In Progress
**Complexity**: Complex
**Type**: New Feature
**Estimated Effort**: 6–10 hours

---

## Feature Overview

### User Story
- As a **partner** (OWNER/EDITOR), I want to create fundraising campaigns so that my organization can raise money for animal care.
- As a **guardian/user**, I want to donate to approved campaigns so that I can contribute to animals' welfare.
- As an **admin**, I want to review campaigns and donation proofs so that the platform maintains trust and transparency.

### Problem Statement
The schema fully supports campaigns and donations but there are zero routes or use cases. Partners cannot create campaigns, guardians cannot donate, and admins have no tools to review them.

### Scope

**In Scope:**
- 4.1 Campaign CRUD: create, list (workspace), get (public/member), update, submit-for-review
- 4.2 Campaign documents: attach, remove
- 4.3 Admin campaign approval: list, approve, reject
- 4.4 Donations: register, list (public)
- 4.5 Admin donation approval: list, approve, reject
- Swagger docs for all endpoints

**Out of Scope:**
- Campaign cover image upload (file upload infra not in scope)
- Campaign ACTIVE/CLOSED lifecycle management (startsAt/endsAt automation)
- Payment processing (proof-based manual approval only)

---

## Current State

**Schema models:**
- `Campaign` — DRAFT → PENDING_REVIEW → APPROVED/REJECTED/CLOSED; optional `petId`; `goalAmount`, `currentAmount`
- `CampaignDocument` — type: MEDICAL_REPORT | COST_ESTIMATE | INVOICE | PHOTO_EVIDENCE | OTHER; status: PENDING_REVIEW | APPROVED | REJECTED
- `Donation` — `paymentMethod` (PIX | TRANSFER | OTHER); `proofUrl`; status: PENDING_REVIEW | APPROVED | REJECTED; increments `campaign.currentAmount` on approval

**No existing repositories, use cases, or routes for campaigns or donations.**

---

## Requirements

### FR1: Campaign management (partner)
- Create campaign: OWNER/EDITOR; body `{ title, description, goalAmount, currency?, petId? }`
- List workspace campaigns: OWNER/EDITOR/ADMIN; filters `status`, pagination
- Get campaign: public if APPROVED; workspace member or ADMIN otherwise
- Update campaign: OWNER/EDITOR; blocked if status ≠ DRAFT
- Submit for review: OWNER/EDITOR; DRAFT → PENDING_REVIEW; blocked if no documents

### FR2: Campaign documents (partner)
- Attach document: OWNER/EDITOR; body `{ type, title, description, fileUrl, storagePath, mimeType, fileSize }`
- Remove document: OWNER/EDITOR; hard delete

### FR3: Admin campaign approval
- List campaigns: ADMIN/SUPER_ADMIN; filters `status`, `workspaceId`, pagination
- Approve: ADMIN/SUPER_ADMIN; PENDING_REVIEW → APPROVED
- Reject: ADMIN/SUPER_ADMIN; PENDING_REVIEW → REJECTED; body `{ reviewNote }` required

### FR4: Donations (authenticated)
- Register donation: authenticated; body `{ amount, currency?, paymentMethod, proofUrl, storagePath, mimeType, fileSize, message? }`; campaign must be APPROVED
- List donations for campaign: public; returns `{ id, amount, currency, paymentMethod, createdAt }` (no personal data)

### FR5: Admin donation approval
- List donations: ADMIN/SUPER_ADMIN; filters `status`, `campaignId`, pagination
- Approve: ADMIN/SUPER_ADMIN; increments `campaign.currentAmount`
- Reject: ADMIN/SUPER_ADMIN; body `{ reviewNote }` required

---

## RBAC Table

| Endpoint | GUARDIAN | PARTNER OWNER | PARTNER EDITOR | ADMIN/SUPER_ADMIN | Public |
|---|---|---|---|---|---|
| POST /workspaces/:id/campaigns | ❌ | ✅ | ✅ | ✅ | ❌ |
| GET /workspaces/:id/campaigns | ❌ | ✅ | ✅ | ✅ | ❌ |
| GET /campaigns/:id | ❌ | ✅ (own) | ✅ (own) | ✅ | ✅ if APPROVED |
| PATCH /campaigns/:id | ❌ | ✅ | ✅ | ❌ | ❌ |
| POST /campaigns/:id/submit-for-review | ❌ | ✅ | ✅ | ❌ | ❌ |
| POST /campaigns/:id/documents | ❌ | ✅ | ✅ | ❌ | ❌ |
| DELETE /campaigns/:id/documents/:docId | ❌ | ✅ | ✅ | ❌ | ❌ |
| GET /admin/campaigns | ❌ | ❌ | ❌ | ✅ | ❌ |
| POST /admin/campaigns/:id/approve | ❌ | ❌ | ❌ | ✅ | ❌ |
| POST /admin/campaigns/:id/reject | ❌ | ❌ | ❌ | ✅ | ❌ |
| POST /campaigns/:id/donations | ✅ | ✅ | ✅ | ✅ | ❌ |
| GET /campaigns/:id/donations | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /admin/donations | ❌ | ❌ | ❌ | ✅ | ❌ |
| POST /admin/donations/:id/approve | ❌ | ❌ | ❌ | ✅ | ❌ |
| POST /admin/donations/:id/reject | ❌ | ❌ | ❌ | ✅ | ❌ |

---

## Error code → HTTP

| Code | HTTP |
|---|---|
| UNAUTHENTICATED | 401 |
| FORBIDDEN | 403 |
| NOT_FOUND | 404 |
| CAMPAIGN_NOT_EDITABLE | 409 |
| CAMPAIGN_NOT_REVIEWABLE | 409 |
| CAMPAIGN_NOT_APPROVABLE | 409 |
| CAMPAIGN_NOT_APPROVED | 409 |
| NO_DOCUMENTS | 409 |
| WORKSPACE_BLOCKED | 409 |

---

## Files to Change

### New Files
- [ ] `server/repositories/campaign.repository.ts`
- [ ] `server/repositories/donation.repository.ts`
- [ ] `server/use-cases/campaigns/create-campaign.use-case.ts`
- [ ] `server/use-cases/campaigns/list-workspace-campaigns.use-case.ts`
- [ ] `server/use-cases/campaigns/get-campaign-by-id.use-case.ts`
- [ ] `server/use-cases/campaigns/update-campaign.use-case.ts`
- [ ] `server/use-cases/campaigns/submit-campaign-for-review.use-case.ts`
- [ ] `server/use-cases/campaigns/add-campaign-document.use-case.ts`
- [ ] `server/use-cases/campaigns/remove-campaign-document.use-case.ts`
- [ ] `server/use-cases/campaigns/list-admin-campaigns.use-case.ts`
- [ ] `server/use-cases/campaigns/approve-campaign.use-case.ts`
- [ ] `server/use-cases/campaigns/reject-campaign.use-case.ts`
- [ ] `server/use-cases/donations/register-donation.use-case.ts`
- [ ] `server/use-cases/donations/list-campaign-donations.use-case.ts`
- [ ] `server/use-cases/donations/list-admin-donations.use-case.ts`
- [ ] `server/use-cases/donations/approve-donation.use-case.ts`
- [ ] `server/use-cases/donations/reject-donation.use-case.ts`
- [ ] `server/schemas/campaign.schema.ts`
- [ ] `server/schemas/donation.schema.ts`
- [ ] `app/api/workspaces/[id]/campaigns/route.ts`
- [ ] `app/api/campaigns/[id]/route.ts`
- [ ] `app/api/campaigns/[id]/submit-for-review/route.ts`
- [ ] `app/api/campaigns/[id]/documents/route.ts`
- [ ] `app/api/campaigns/[id]/documents/[docId]/route.ts`
- [ ] `app/api/campaigns/[id]/donations/route.ts`
- [ ] `app/api/admin/campaigns/route.ts`
- [ ] `app/api/admin/campaigns/[id]/approve/route.ts`
- [ ] `app/api/admin/campaigns/[id]/reject/route.ts`
- [ ] `app/api/admin/donations/route.ts`
- [ ] `app/api/admin/donations/[id]/approve/route.ts`
- [ ] `app/api/admin/donations/[id]/reject/route.ts`
- [ ] `lib/swagger/definitions/campaigns.ts`
- [ ] `lib/swagger/definitions/donations.ts`

### Modified Files
- [ ] `server/repositories/index.ts` — export new repositories
- [ ] `server/use-cases/index.ts` — export new use cases

---

## Dependencies

**Blocks:** Phase 5 (Admin Tools), Phase 6 (Metrics), Phase 7 (Discovery)
**Blocked By:** None (Phase 0.5 ✅, Phase 2 ✅)
