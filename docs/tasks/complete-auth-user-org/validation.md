# Validation: Complete Auth & User/Org

**Date**: 2026-03-11
**Phase**: PLANNING
**Status**: Pending Implementation

---

## Pre-Implementation Criteria

### Functional Criteria

| ID | Criterion | Sub-step |
|----|-----------|----------|
| F1 | `POST /auth/forgot-password` always returns 200 regardless of email existence | 0.1 |
| F2 | `POST /auth/reset-password` with valid token resets password, clears token | 0.1 |
| F3 | `POST /auth/reset-password` with expired/invalid token returns 400 | 0.1 |
| F4 | `POST /auth/verify-email` with valid JWT sets `emailVerified=true` | 0.2 |
| F5 | `POST /auth/verify-email` with already-verified user returns 409 | 0.2 |
| F6 | `POST /auth/resend-verification` returns 200 for active unverified user | 0.2 |
| F7 | `PATCH /me` updates fullName and/or phone | 0.3 |
| F8 | `PATCH /me/password` with correct current password updates hash | 0.3 |
| F9 | `PATCH /me/password` with wrong current password returns 400 | 0.3 |
| F10 | `PATCH /workspaces/:id/members/:memberId` OWNER can change role | 0.4 |
| F11 | `PATCH /workspaces/:id/members/:memberId` EDITOR cannot change role (403) | 0.4 |
| F12 | OWNER cannot update their own role (400) | 0.4 |
| F13 | `GET /workspaces/:id/city-coverage` returns coverage list | 0.5 |
| F14 | `POST /workspaces/:id/city-coverage` OWNER adds city | 0.5 |
| F15 | `POST /workspaces/:id/city-coverage` duplicate cityPlaceId returns 409 | 0.5 |
| F16 | `DELETE /workspaces/:id/city-coverage/:coverageId` OWNER removes city | 0.5 |
| F17 | `DELETE /workspaces/:id` OWNER deactivates workspace | 0.6 |
| F18 | `DELETE /workspaces/:id` blocked when active adoption has pending follow-up (409) | 0.6 |
| F19 | Non-member cannot access workspace endpoints (403) | all |

### Architectural Criteria

| ID | Criterion |
|----|-----------|
| A1 | Token stored as sha256 hash in DB, raw token never persisted |
| A2 | Email verify uses signed JWT, no new DB columns |
| A3 | All use cases return discriminated union `{ success: true } | { success: false; code }` |
| A4 | All routes use `getPrincipal(req)` for auth |
| A5 | No business logic in route handlers |

---

## QA Checklist: Sub-step 0.1 — Password Reset

```
POST /api/auth/forgot-password
  Body: { "email": "existing@example.com" }
  Expected: 200 { "message": "..." }

POST /api/auth/forgot-password
  Body: { "email": "nonexistent@example.com" }
  Expected: 200 (same response, no enumeration)

POST /api/auth/reset-password
  Body: { "token": "<raw token from logs>", "newPassword": "newpassword123" }
  Expected: 200 { "message": "..." }

POST /api/auth/reset-password
  Body: { "token": "invalidtoken", "newPassword": "newpassword123" }
  Expected: 400 { "code": "INVALID_OR_EXPIRED_TOKEN" }

POST /api/auth/reset-password (reuse same token)
  Expected: 400 (token cleared after first use)

POST /api/auth/login
  Body: { "email": "...", "password": "newpassword123" }
  Expected: 200 (login succeeds with new password)
```

---

## QA Checklist: Sub-step 0.2 — Email Verification

```
POST /api/auth/resend-verification
  Headers: Cookie: bth_access=<token for unverified user>
  Expected: 200 { "message": "..." }
  Side effect: JWT token logged to console

POST /api/auth/verify-email
  Body: { "token": "<JWT from logs>" }
  Expected: 200 { "message": "..." }

GET /api/me
  Expected: emailVerified: true

POST /api/auth/verify-email (reuse same token)
  Expected: 409 { "code": "ALREADY_VERIFIED" }

POST /api/auth/verify-email
  Body: { "token": "invalidjwt" }
  Expected: 400 { "code": "INVALID_OR_EXPIRED_TOKEN" }
```

---

## QA Checklist: Sub-step 0.3 — User Profile

```
PATCH /api/me
  Headers: Cookie: bth_access=<token>
  Body: { "fullName": "New Name" }
  Expected: 200 { "data": { "fullName": "New Name", "phone": null } }

PATCH /api/me
  Body: { "phone": "+5511999999999" }
  Expected: 200 { "data": { ... "phone": "+5511999999999" } }

PATCH /api/me
  No auth cookie
  Expected: 401

PATCH /api/me/password
  Body: { "currentPassword": "currentpass", "newPassword": "newpass123" }
  Expected: 200 { "message": "..." }

PATCH /api/me/password
  Body: { "currentPassword": "wrongpass", "newPassword": "newpass123" }
  Expected: 400 { "code": "WRONG_PASSWORD" }

POST /api/auth/login (verify new password works)
  Expected: 200
```

---

## QA Checklist: Sub-step 0.4 — Member Role Update

```
PATCH /api/workspaces/:id/members/:memberId
  Headers: Cookie: bth_access=<OWNER token>
  Body: { "role": "EDITOR" }
  Expected: 200 { "message": "..." }

PATCH /api/workspaces/:id/members/:memberId
  Headers: Cookie: bth_access=<EDITOR token>
  Body: { "role": "FINANCIAL" }
  Expected: 403

PATCH /api/workspaces/:id/members/:ownerId (self-update)
  Headers: Cookie: bth_access=<OWNER token>
  Body: { "role": "EDITOR" }
  Expected: 400 { "code": "CANNOT_UPDATE_OWN_ROLE" }

PATCH /api/workspaces/:id/members/nonexistent-uuid
  Expected: 404
```

---

## QA Checklist: Sub-step 0.5 — City Coverage

```
GET /api/workspaces/:id/city-coverage
  Headers: Cookie: bth_access=<OWNER token>
  Expected: 200 { "data": [] }

POST /api/workspaces/:id/city-coverage
  Body: { "cityPlaceId": "<valid city uuid>" }
  Expected: 201 { "data": { "id": "...", "cityPlaceId": "..." } }

POST /api/workspaces/:id/city-coverage (same cityPlaceId)
  Expected: 409 { "code": "ALREADY_EXISTS" }

GET /api/workspaces/:id/city-coverage
  Expected: 200 { "data": [{ "id": "...", "cityPlaceId": "...", "cityPlace": { ... } }] }

DELETE /api/workspaces/:id/city-coverage/:coverageId
  Expected: 200 or 204

DELETE /api/workspaces/:id/city-coverage/nonexistent-uuid
  Expected: 404
```

---

## QA Checklist: Sub-step 0.6 — Workspace Deactivation

```
DELETE /api/workspaces/:id
  Headers: Cookie: bth_access=<OWNER token, workspace with no active adoptions>
  Expected: 200 or 204

GET /api/workspaces/:id
  Expected: 404 or workspace with isActive: false

DELETE /api/workspaces/:id
  Headers: Cookie: bth_access=<EDITOR token>
  Expected: 403

DELETE /api/workspaces/:id (workspace with active adoption + pending follow-up)
  Expected: 409 { "code": "HAS_ACTIVE_ADOPTIONS" }
```

---

## Post-Implementation Results

_To be filled after EXECUTION phase_

### Functional Tests

| ID | Result | Notes |
|----|--------|-------|
| F1 | ⬜ | |
| F2 | ⬜ | |
| F3 | ⬜ | |
| F4 | ⬜ | |
| F5 | ⬜ | |
| F6 | ⬜ | |
| F7 | ⬜ | |
| F8 | ⬜ | |
| F9 | ⬜ | |
| F10 | ⬜ | |
| F11 | ⬜ | |
| F12 | ⬜ | |
| F13 | ⬜ | |
| F14 | ⬜ | |
| F15 | ⬜ | |
| F16 | ⬜ | |
| F17 | ⬜ | |
| F18 | ⬜ | |
| F19 | ⬜ | |

### Files Modified

```
_To be filled after implementation_
```

---

## Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Developer | | | ⬜ |
| Reviewer | | | ⬜ |
