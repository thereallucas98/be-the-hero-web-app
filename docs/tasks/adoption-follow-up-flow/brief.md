# Task Brief: Adoption Follow-up Flow

**Created**: 2026-03-21
**Status**: Pending Approval
**Complexity**: Medium
**Type**: API Endpoints
**Phase**: Phase 3 (Roadmap)

---

## Feature Overview

### User Stories

As a **guardian**, I want to see the follow-up schedule for my adoption so I know what's due and when.

As a **guardian**, I want to submit a follow-up with a photo proving the pet is well, so the platform can confirm responsible adoption.

As a **guardian**, I want to see all my adoptions and their follow-up statuses in one place.

As a **platform admin**, I want to review submitted follow-ups and approve or reject them with feedback.

### Problem Statement

The adoption lifecycle ends at registration. Three follow-up records are auto-created (30 days, 6 months, 1 year) but there are no routes to read or act on them. Guardians can't see what's due; they can't submit proof photos; admins can't review anything. The platform's core responsibility promise is currently unenforceable.

### Scope

**In Scope:**
- 3.1 `GET /api/adoptions/:id/follow-ups` — list all 3 follow-ups with current submission status
- 3.2 `POST /api/follow-ups/:id/submissions` — guardian submits photo proof + message
- 3.3 `GET /api/admin/follow-up-submissions` — paginated list with status + workspaceId filters
- 3.4 `POST /api/admin/follow-up-submissions/:id/approve` — approve submission
- 3.5 `POST /api/admin/follow-up-submissions/:id/reject` — reject with reviewNote
- 3.6 `GET /api/me/adoptions` — guardian's own adoption history with follow-up statuses

**Out of Scope:**
- Photo upload to Supabase (URL-based stubs, same as pet images)
- Email notifications
- Bulk admin operations

---

## Acceptance Criteria

- [ ] **AC1**: `GET /api/adoptions/:id/follow-ups` returns 3 follow-ups sorted by scheduledAt, accessible by guardian/OWNER/EDITOR/ADMIN
- [ ] **AC2**: `GET /api/adoptions/:id/follow-ups` returns 401/403 for unauthorized callers
- [ ] **AC3**: `POST /api/follow-ups/:id/submissions` creates submission, updates follow-up status to SUBMITTED
- [ ] **AC4**: Guardian cannot submit for an adoption they don't own → 403
- [ ] **AC5**: Guardian cannot submit a follow-up that isn't due yet → 422
- [ ] **AC6**: Guardian cannot resubmit an APPROVED follow-up → 409
- [ ] **AC7**: Guardian CAN resubmit a REJECTED follow-up (status resets to SUBMITTED)
- [ ] **AC8**: `GET /api/admin/follow-up-submissions` returns paginated list, filterable by status and workspaceId
- [ ] **AC9**: `POST /api/admin/follow-up-submissions/:id/approve` sets submission + follow-up to APPROVED
- [ ] **AC10**: `POST /api/admin/follow-up-submissions/:id/reject` sets submission to REJECTED with reviewNote; follow-up returns to PENDING (re-submittable)
- [ ] **AC11**: Approving/rejecting already-reviewed submission → 409
- [ ] **AC12**: `GET /api/me/adoptions` returns guardian's adoptions with pet summary + follow-up statuses
- [ ] **AC13**: Non-GUARDIAN role calling `GET /api/me/adoptions` → 403

---

## Dependencies

**Blocks:** Phase 6 (Metrics — follow-up data needed for analytics)
**Blocked By:** Phase 1 ✅ (complete)
