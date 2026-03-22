# API Roadmap — BeTheHero

> Status legend: ✅ Done · 🔲 To do

---

## Current State (already implemented)

- ✅ Auth: register, login, logout
- ✅ `GET /api/me` — current user context
- ✅ Pets: list (public), create, update, submit for review, get by id (full public detail)
- ✅ Pet images: add, update (position/cover), delete
- ✅ Pet requirements: add, update, delete
- ✅ Pet metrics tracking: `POST /api/pets/:id/track`
- ✅ Adoption interests: register (guardian), list by workspace, list mine, withdraw, dismiss, convert to adoption
- ✅ Adoptions: register, get by id (with follow-ups status), list mine (guardian)
- ✅ Adoption follow-ups: list for adoption, guardian submit, admin list/approve/reject submissions
- ✅ Workspaces: create, list mine, get, update, update location, manage members (add/remove/update role), deactivate
- ✅ Workspace city coverage: list, add, remove
- ✅ Admin: approve/reject pets, approve/reject follow-up submissions
- ✅ Auth: password reset (forgot + reset), email verification (verify + resend)
- ✅ `PATCH /api/me` — update profile; `PATCH /api/me/password` — change password
- ✅ Geo: `GET /api/geo/states`, `GET /api/geo/cities`
- ✅ Campaigns: create, list (workspace), get, update, submit-for-review, documents (add/remove)
- ✅ Admin campaigns: list, approve, reject (with reviewNote)
- ✅ Donations: register, list campaign donations
- ✅ Admin donations: list, approve (increments currentAmount), reject (with reviewNote)

---

## Phase 0 — Complete Auth & User/Org

These are gaps in features that are already started. The schema fields exist; only the routes are missing.

### 0.1 Password reset ✅

- ✅ `POST /api/auth/forgot-password` — generate reset token, send via email
- ✅ `POST /api/auth/reset-password` — consume token, set new password

### 0.2 Email verification ✅

- ✅ `POST /api/auth/verify-email` — verify email address with token
- ✅ `POST /api/auth/resend-verification` — resend verification email

### 0.3 User profile self-management ✅

- ✅ `PATCH /api/me` — update own profile
- ✅ `PATCH /api/me/password` — change own password

### 0.4 Workspace member role update ✅

- ✅ `PATCH /api/workspaces/:id/members/:memberId` — update member role

### 0.5 Workspace city coverage ✅

- ✅ `GET /api/workspaces/:id/city-coverage` — list cities this workspace covers
- ✅ `POST /api/workspaces/:id/city-coverage` — add a city to workspace coverage
- ✅ `DELETE /api/workspaces/:id/city-coverage/:coverageId` — remove city from coverage

### 0.6 Workspace deactivation ✅

- ✅ `DELETE /api/workspaces/:id` — soft-delete (deactivate) workspace

---

## Phase 1 — Complete the Pet Flow ✅

### 1.1 Pet requirements ✅

- ✅ `POST /api/pets/:id/requirements` — add requirement to pet
- ✅ `PATCH /api/pets/:id/requirements/:reqId` — update requirement
- ✅ `DELETE /api/pets/:id/requirements/:reqId` — remove requirement

### 1.2 Pet detail for public ✅

- ✅ `GET /api/pets/:id` — full public pet detail (images, requirements, workspace, approvedAt)

### 1.3 Pet metrics tracking ✅

- ✅ `POST /api/pets/:id/track` — record client-side metric event (VIEW_PET, CLICK_WHATSAPP, REGISTER_INTEREST)

---

## Phase 2 — Geo/Location Support ✅

### 2.1 Public geo lookup ✅

- ✅ `GET /api/geo/states` — list all states (optionally filtered by `countryId`)
- ✅ `GET /api/geo/cities` — list cities, optionally filtered by `stateId`

---

## Phase 3 — Adoption Follow-up Workflow ✅

### 3.1 List follow-ups ✅

- ✅ `GET /api/adoptions/:id/follow-ups` — list all follow-ups for an adoption (schedule, status, submission)

### 3.2 Guardian submits follow-up ✅

- ✅ `POST /api/follow-ups/:id/submissions` — guardian submits follow-up

### 3.3 Admin reviews follow-up submissions ✅

- ✅ `GET /api/admin/follow-up-submissions` — list submissions with filters
- ✅ `POST /api/admin/follow-up-submissions/:id/approve`
- ✅ `POST /api/admin/follow-up-submissions/:id/reject`

### 3.4 Guardian's adoption history ✅

- ✅ `GET /api/me/adoptions` — list all adoptions with pet summary and follow-up statuses

---

## Phase 4 — Campaign & Donation System ✅

Fundraising feature for partner organizations to support animal care.

### 4.1 Campaign management (partner) ✅
- ✅ `POST /api/workspaces/:id/campaigns` — create campaign
- ✅ `GET /api/workspaces/:id/campaigns` — list campaigns for a workspace
- ✅ `GET /api/campaigns/:id` — get campaign details (public if approved)
- ✅ `PATCH /api/campaigns/:id` — update campaign (while in DRAFT)
- ✅ `POST /api/campaigns/:id/submit-for-review` — submit campaign for admin review

### 4.2 Campaign documents (partner) ✅
- ✅ `POST /api/campaigns/:id/documents` — attach document to campaign
- ✅ `DELETE /api/campaigns/:id/documents/:docId` — remove document

### 4.3 Admin campaign approval ✅
- ✅ `GET /api/admin/campaigns` — list all campaigns with filters
- ✅ `POST /api/admin/campaigns/:id/approve` — approve campaign
- ✅ `POST /api/admin/campaigns/:id/reject` — reject campaign (stores reviewNote)

### 4.4 Donations ✅
- ✅ `POST /api/campaigns/:id/donations` — register a donation (any authenticated user)
- ✅ `GET /api/campaigns/:id/donations` — list donations (workspace members or admin)

### 4.5 Admin donation approval ✅
- ✅ `GET /api/admin/donations` — list donations with filters
- ✅ `POST /api/admin/donations/:id/approve` — approve donation (increments campaign currentAmount)
- ✅ `POST /api/admin/donations/:id/reject` — reject donation (stores reviewNote)

---

## Phase 5 — Admin Tools ✅

Operational tools for platform management.

### 5.1 Admin coverage ✅
- ✅ `GET /api/admin/coverage` — list cities covered by the logged-in admin
  - RBAC: ADMIN
- ✅ `POST /api/admin/coverage` — assign city coverage to an admin
  - Body: `{ adminUserId, cityId }`
  - RBAC: SUPER_ADMIN
- ✅ `DELETE /api/admin/coverage/:id` — remove coverage assignment
  - RBAC: SUPER_ADMIN

### 5.2 Workspace verification ✅
- ✅ `GET /api/admin/workspaces` — list workspaces pending verification
  - Filters: `verificationStatus`, pagination
  - RBAC: ADMIN, SUPER_ADMIN
- ✅ `POST /api/admin/workspaces/:id/approve` — verify workspace
  - RBAC: ADMIN, SUPER_ADMIN
- ✅ `POST /api/admin/workspaces/:id/reject` — reject workspace verification
  - Body: `{ reviewNote }`
  - RBAC: ADMIN, SUPER_ADMIN

### 5.3 Audit logs ✅
- ✅ `GET /api/admin/audit-logs` — query audit trail
  - Filters: `actorId`, `entityType`, `action`, `dateFrom`, `dateTo`, pagination
  - RBAC: SUPER_ADMIN

---

## Phase 6 — Analytics & Metrics ✅

Insights for partners and platform admins.

### 6.1 Pet metrics (partner) ✅
- ✅ `GET /api/workspaces/:id/metrics` — workspace-level summary
  - Returns: totalPets, petsByStatus, totalViews, totalWhatsappClicks, totalInterests, totalAdoptions, totalDonationsRaised
  - RBAC: workspace members (OWNER/EDITOR/FINANCIAL) or ADMIN/SUPER_ADMIN
- ✅ `GET /api/pets/:id/metrics` — per-pet metrics
  - Returns: views, whatsappClicks, interestCount, petStatus, adoptionId, adoptedAt
  - RBAC: workspace members or ADMIN/SUPER_ADMIN

### 6.2 Platform metrics (admin) ✅
- ✅ `GET /api/admin/metrics` — platform-wide dashboard data
  - Returns: totalPets, petsByStatus, totalAdoptions, totalCampaigns, campaignsByStatus, totalDonationsRaised, totalActiveWorkspaces
  - Filters: `cityId`, `dateFrom`, `dateTo`
  - RBAC: ADMIN, SUPER_ADMIN

---

## Phase 7 — Public Discovery

Improve the public-facing experience for guardians browsing pets.

### 7.1 Enhanced pet listing
- 🔲 `GET /api/pets` — extend current endpoint with additional filters:
  - Add: `species`, `size`, `ageCategory`, `workspaceId` (already partially done — confirm coverage)
  - Add: `hasRequirements=false` for users who want low-barrier adoptions

### 7.2 Public workspace profile
- 🔲 `GET /api/workspaces/:id/public` — public-facing workspace page
  - Returns: name, type, description, city, approved pets, active campaigns
  - No auth required

### 7.3 Campaign discovery
- 🔲 `GET /api/campaigns` — list all active/approved campaigns publicly
  - Filters: `cityId`, `workspaceId`, `petId`, pagination
  - No auth required

---

## Dependency Order (summary)

```
Phase 0 (Auth & User/Org) ← ✅ DONE
Phase 1 (Pet flow)        ← ✅ DONE
Phase 2 (Geo)             ← ✅ DONE
Phase 3 (Follow-ups)      ← ✅ DONE
Phase 4 (Campaigns)       ← ✅ DONE
Phase 5 (Admin tools)     ← depends on Phase 0 ✅ + Phase 2 ✅ + Phase 4 ✅ ← ✅ DONE
Phase 6 (Metrics)         ← depends on Phase 1 ✅ + Phase 3 ✅ + Phase 4 ✅ ← ✅ DONE
Phase 7 (Discovery)       ← depends on Phase 4 + Phase 6
```
