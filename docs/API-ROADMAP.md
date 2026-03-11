# API Roadmap — BeTheHero

> Status legend: ✅ Done · 🔲 To do

---

## Current State (already implemented)

- ✅ Auth: register, login, logout
- ✅ `GET /api/me` — current user context
- ✅ Pets: list (public), create, update, submit for review, get by id
- ✅ Pet images: add, update (position/cover), delete
- ✅ Adoption interests: register (guardian), list by workspace
- ✅ Adoptions: register, get by id (with follow-ups status)
- ✅ Workspaces: create, list mine, get, update, update location, manage members (add/remove)
- ✅ Admin: approve/reject pets

---

## Phase 0 — Complete Auth & User/Org

These are gaps in features that are already started. The schema fields exist; only the routes are missing.

### 0.1 Password reset
> `resetToken` and `resetTokenExpires` exist on the `User` model but have no routes.

- 🔲 `POST /api/auth/forgot-password` — generate reset token, send via email
  - Body: `{ email }`
  - Public endpoint; always returns 200 (no user enumeration)
- 🔲 `POST /api/auth/reset-password` — consume token, set new password
  - Body: `{ token, newPassword }`
  - Invalidates token on use; returns 400 if expired

### 0.2 Email verification
> `emailVerified` exists on `User` and is returned by `GET /api/me` but is never set to `true`.

- 🔲 `POST /api/auth/verify-email` — verify email address with token
  - Body: `{ token }`
  - Sets `emailVerified = true`; invalidates token
- 🔲 `POST /api/auth/resend-verification` — resend verification email
  - RBAC: authenticated (token in cookie)
  - Rate-limited; no-op if already verified

### 0.3 User profile self-management
- 🔲 `PATCH /api/me` — update own profile
  - Body: `{ fullName?, phone? }`
  - RBAC: authenticated
- 🔲 `PATCH /api/me/password` — change own password
  - Body: `{ currentPassword, newPassword }`
  - RBAC: authenticated; validates `currentPassword` before updating

### 0.4 Workspace member role update
> Members can be added and removed, but their role cannot be changed.

- 🔲 `PATCH /api/workspaces/:id/members/:memberId` — update member role
  - Body: `{ role: 'OWNER' | 'EDITOR' | 'FINANCIAL' }`
  - RBAC: workspace OWNER only
  - Business rule: cannot demote the last OWNER

### 0.5 Workspace city coverage
> `PartnerCityCoverage` exists in the schema (workspace can cover multiple cities) but has zero routes. Used to filter pets and assign admin oversight.

- 🔲 `GET /api/workspaces/:id/city-coverage` — list cities this workspace covers
  - RBAC: workspace OWNER, EDITOR, or ADMIN
- 🔲 `POST /api/workspaces/:id/city-coverage` — add a city to workspace coverage
  - Body: `{ cityPlaceId }`
  - RBAC: workspace OWNER
- 🔲 `DELETE /api/workspaces/:id/city-coverage/:coverageId` — remove city from coverage
  - RBAC: workspace OWNER

### 0.6 Workspace deactivation
> `PartnerWorkspace.isActive` exists but there is no way to deactivate a workspace.

- 🔲 `DELETE /api/workspaces/:id` — soft-delete (deactivate) workspace
  - RBAC: workspace OWNER only
  - Business rule: cannot deactivate if there are active adoptions with pending follow-ups

---

## Phase 1 — Complete the Pet Flow

Everything a partner needs to fully manage pets before they are adoptable.

### 1.1 Pet requirements
- 🔲 `POST /api/pets/:id/requirements` — add requirement to pet
  - Fields: `description`, `category` (enum), `mandatory` (bool)
  - RBAC: workspace OWNER or EDITOR
- 🔲 `PATCH /api/pets/:id/requirements/:reqId` — update requirement
  - RBAC: workspace OWNER or EDITOR
- 🔲 `DELETE /api/pets/:id/requirements/:reqId` — remove requirement
  - RBAC: workspace OWNER or EDITOR

### 1.2 Pet detail for public
- 🔲 `GET /api/pets/:id` — get full public pet detail
  - Include: images, requirements, workspace summary, adoption status
  - Track `PetMetricEvent` (type: `PET_VIEW`) on each call

### 1.3 Pet metrics tracking
- 🔲 `POST /api/pets/:id/track` — record client-side metric event
  - Body: `{ event: 'PET_VIEW' | 'CLICK_WHATSAPP' | 'REGISTER_INTEREST' }`
  - Public endpoint (no auth required)

---

## Phase 2 — Geo/Location Support

Required by workspace creation, pet filtering, and admin coverage assignment.

### 2.1 Public geo lookup
- 🔲 `GET /api/geo/states` — list all states (optionally filtered by `countryId`)
- 🔲 `GET /api/geo/cities` — list cities, filtered by `stateId`
  - Used in: workspace location form, pet listing filters, admin coverage

---

## Phase 3 — Adoption Follow-up Workflow

Core to the platform's responsibility promise. Follow-ups are auto-created on adoption but currently inaccessible.

### 3.1 List follow-ups
- 🔲 `GET /api/adoptions/:id/follow-ups` — list all follow-ups for an adoption
  - Returns: schedule, status, submission if exists
  - RBAC: adoption's guardian, workspace OWNER/EDITOR, ADMIN

### 3.2 Guardian submits follow-up
- 🔲 `POST /api/follow-ups/:id/submissions` — guardian submits follow-up
  - Body: `{ message, photoUrl, photoStoragePath }`
  - RBAC: GUARDIAN who owns the adoption
  - Business rules: can only submit once per follow-up; follow-up must be due (not future)

### 3.3 Admin reviews follow-up submissions
- 🔲 `GET /api/admin/follow-up-submissions` — list pending submissions
  - Filters: `status` (PENDING, APPROVED, REJECTED), `workspaceId`, pagination
  - RBAC: ADMIN, SUPER_ADMIN
- 🔲 `POST /api/admin/follow-up-submissions/:id/approve` — approve submission
  - RBAC: ADMIN, SUPER_ADMIN
- 🔲 `POST /api/admin/follow-up-submissions/:id/reject` — reject submission
  - Body: `{ reviewNote }` (required)
  - RBAC: ADMIN, SUPER_ADMIN

### 3.4 Guardian's adoption history
- 🔲 `GET /api/me/adoptions` — list all adoptions for the logged-in guardian
  - Include: pet summary, follow-up statuses
  - RBAC: GUARDIAN

---

## Phase 4 — Campaign & Donation System

Fundraising feature for partner organizations to support animal care.

### 4.1 Campaign management (partner)
- 🔲 `POST /api/workspaces/:id/campaigns` — create campaign
  - Body: `{ title, description, goalAmount, currency, petId? }`
  - RBAC: workspace OWNER or EDITOR
- 🔲 `GET /api/workspaces/:id/campaigns` — list campaigns for a workspace
  - Filters: `status` (PENDING_REVIEW, APPROVED, ACTIVE, CLOSED), pagination
  - RBAC: workspace OWNER, EDITOR, or ADMIN
- 🔲 `GET /api/campaigns/:id` — get campaign details (public if approved)
  - Include: documents, total raised, donation count
- 🔲 `PATCH /api/campaigns/:id` — update campaign (while in DRAFT)
  - RBAC: workspace OWNER or EDITOR
- 🔲 `POST /api/campaigns/:id/submit-for-review` — submit campaign for admin review
  - RBAC: workspace OWNER or EDITOR

### 4.2 Campaign documents (partner)
- 🔲 `POST /api/campaigns/:id/documents` — attach document to campaign
  - Body: `{ title, type, url, storagePath }`
  - RBAC: workspace OWNER or EDITOR
- 🔲 `DELETE /api/campaigns/:id/documents/:docId` — remove document
  - RBAC: workspace OWNER or EDITOR

### 4.3 Admin campaign approval
- 🔲 `GET /api/admin/campaigns` — list campaigns pending review
  - Filters: `status`, `workspaceId`, pagination
  - RBAC: ADMIN, SUPER_ADMIN
- 🔲 `POST /api/admin/campaigns/:id/approve` — approve campaign
  - RBAC: ADMIN, SUPER_ADMIN
- 🔲 `POST /api/admin/campaigns/:id/reject` — reject campaign
  - Body: `{ reviewNote }` (required)
  - RBAC: ADMIN, SUPER_ADMIN

### 4.4 Donations (public/guardian)
- 🔲 `POST /api/campaigns/:id/donations` — register a donation
  - Body: `{ amount, currency, proofUrl, proofStoragePath, message? }`
  - RBAC: GUARDIAN or authenticated user
- 🔲 `GET /api/campaigns/:id/donations` — list donations for a campaign (public)
  - Returns: anonymous donor, amount, date (no personal data)

### 4.5 Admin donation approval
- 🔲 `GET /api/admin/donations` — list donations pending proof review
  - Filters: `status`, `campaignId`, pagination
  - RBAC: ADMIN, SUPER_ADMIN
- 🔲 `POST /api/admin/donations/:id/approve` — approve donation
  - RBAC: ADMIN, SUPER_ADMIN
- 🔲 `POST /api/admin/donations/:id/reject` — reject donation
  - Body: `{ reviewNote }`
  - RBAC: ADMIN, SUPER_ADMIN

---

## Phase 5 — Admin Tools

Operational tools for platform management.

### 5.1 Admin coverage
- 🔲 `GET /api/admin/coverage` — list cities covered by the logged-in admin
  - RBAC: ADMIN
- 🔲 `POST /api/admin/coverage` — assign city coverage to an admin
  - Body: `{ adminUserId, cityId }`
  - RBAC: SUPER_ADMIN
- 🔲 `DELETE /api/admin/coverage/:id` — remove coverage assignment
  - RBAC: SUPER_ADMIN

### 5.2 Workspace verification
- 🔲 `GET /api/admin/workspaces` — list workspaces pending verification
  - Filters: `verificationStatus`, `cityId`, pagination
  - RBAC: ADMIN, SUPER_ADMIN
- 🔲 `POST /api/admin/workspaces/:id/approve` — verify workspace
  - RBAC: ADMIN, SUPER_ADMIN
- 🔲 `POST /api/admin/workspaces/:id/reject` — reject workspace verification
  - Body: `{ reviewNote }`
  - RBAC: ADMIN, SUPER_ADMIN

### 5.3 Audit logs
- 🔲 `GET /api/admin/audit-logs` — query audit trail
  - Filters: `actorId`, `entityType`, `action`, `dateFrom`, `dateTo`, pagination
  - RBAC: SUPER_ADMIN

---

## Phase 6 — Analytics & Metrics

Insights for partners and platform admins.

### 6.1 Pet metrics (partner)
- 🔲 `GET /api/workspaces/:id/metrics` — workspace-level summary
  - Returns: total pets, total views, total interests, total adoptions, total donations raised
  - RBAC: workspace OWNER, EDITOR, or ADMIN
- 🔲 `GET /api/pets/:id/metrics` — per-pet metrics
  - Returns: view count, WhatsApp click count, interest count, adoption status
  - RBAC: workspace OWNER, EDITOR, or ADMIN

### 6.2 Platform metrics (admin)
- 🔲 `GET /api/admin/metrics` — platform-wide dashboard data
  - Returns: total pets, adoptions, campaigns, donations, active workspaces by city
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
Phase 0 (Auth & User/Org) ← unblocked, start here — completes existing features
Phase 1 (Pet flow)        ← unblocked
Phase 2 (Geo)             ← unblocked
Phase 3 (Follow-ups)      ← depends on Phase 1
Phase 4 (Campaigns)       ← depends on Phase 0.5 (city coverage) + Phase 2
Phase 5 (Admin tools)     ← depends on Phase 0 + Phase 2 + Phase 4
Phase 6 (Metrics)         ← depends on Phase 1 + Phase 3 + Phase 4
Phase 7 (Discovery)       ← depends on Phase 4 + Phase 6
```
