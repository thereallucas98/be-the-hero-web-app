# Validation: Adoption Follow-up Flow

**Date**: 2026-03-21
**Phase**: PLANNING
**Status**: Pending

---

## Acceptance Criteria Verification

| AC | Criterion | Method | Result |
|----|-----------|--------|--------|
| AC1 | GET /adoptions/:id/follow-ups returns 3 items sorted by scheduledAt | curl (guardian, OWNER, ADMIN) | pending |
| AC2 | Returns 401 (no auth) / 403 (wrong user) | curl | pending |
| AC3 | POST /follow-ups/:id/submissions creates submission, follow-up → SUBMITTED | curl + DB check | pending |
| AC4 | Wrong guardian → 403 | curl (different user cookie) | pending |
| AC5 | Future follow-up → 422 | curl + scheduledAt in future | pending |
| AC6 | APPROVED follow-up → 409 | curl after DB force-approve | pending |
| AC7 | REJECTED follow-up allows resubmit | curl after reject, submit again | pending |
| AC8 | Admin list with status/workspaceId filters | curl with query params | pending |
| AC9 | Approve sets both submission + follow-up to APPROVED | curl + DB check | pending |
| AC10 | Reject sets submission REJECTED, follow-up PENDING | curl + DB check | pending |
| AC11 | Re-approving/rejecting → 409 | curl | pending |
| AC12 | GET /me/adoptions returns guardian's list with pet + follow-up statuses | curl | pending |
| AC13 | Non-GUARDIAN → 403 on /me/adoptions | curl with PARTNER_MEMBER cookie | pending |
