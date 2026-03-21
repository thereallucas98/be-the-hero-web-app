# Validation — Campaign & Donation System

## QA Gate A — Create campaign

| Test | Expected | Result |
|---|---|---|
| POST /workspaces/:id/campaigns valid body | 201 + campaign | 🔲 |
| No auth | 401 | 🔲 |
| Non-member | 403 | 🔲 |
| Invalid workspaceId UUID | 400 | 🔲 |
| Invalid body (missing title) | 400 with details | 🔲 |

## QA Gate B — List + get campaign

| Test | Expected | Result |
|---|---|---|
| GET /workspaces/:id/campaigns (member) | 200 paginated list | 🔲 |
| GET /workspaces/:id/campaigns (non-member) | 403 | 🔲 |
| GET /campaigns/:id (member, DRAFT) | 200 | 🔲 |
| GET /campaigns/:id (unauthenticated, DRAFT) | 403 | 🔲 |
| GET /campaigns/:id (non-existent) | 404 | 🔲 |

## QA Gate C — Update + submit

| Test | Expected | Result |
|---|---|---|
| PATCH /campaigns/:id valid body (DRAFT) | 200 updated | 🔲 |
| PATCH non-DRAFT campaign | 409 CAMPAIGN_NOT_EDITABLE | 🔲 |
| POST /campaigns/:id/submit-for-review (no docs) | 409 NO_DOCUMENTS | 🔲 |
| POST /campaigns/:id/submit-for-review (with docs) | 200 | 🔲 |
| Submit non-DRAFT campaign | 409 | 🔲 |

## QA Gate D — Documents

| Test | Expected | Result |
|---|---|---|
| POST /campaigns/:id/documents valid body | 201 document | 🔲 |
| DELETE /campaigns/:id/documents/:docId | 204 | 🔲 |
| Add doc to non-DRAFT campaign | 409 | 🔲 |
| Remove doc with wrong owner | 403 | 🔲 |

## QA Gate E — Admin campaigns

| Test | Expected | Result |
|---|---|---|
| GET /admin/campaigns (admin) | 200 list | 🔲 |
| GET /admin/campaigns (non-admin) | 403 | 🔲 |
| POST /admin/campaigns/:id/approve | 200 | 🔲 |
| POST /admin/campaigns/:id/reject (no note) | 400 | 🔲 |
| POST /admin/campaigns/:id/reject (with note) | 200 | 🔲 |
| Approve already-approved campaign | 409 | 🔲 |

## QA Gate F — Donations

| Test | Expected | Result |
|---|---|---|
| POST /campaigns/:id/donations (APPROVED campaign) | 201 | 🔲 |
| POST to non-APPROVED campaign | 409 | 🔲 |
| No auth | 401 | 🔲 |
| GET /campaigns/:id/donations (public) | 200 no personal data | 🔲 |

## QA Gate G — Admin donations

| Test | Expected | Result |
|---|---|---|
| GET /admin/donations | 200 list | 🔲 |
| POST /admin/donations/:id/approve | 200 + currentAmount updated | 🔲 |
| POST /admin/donations/:id/reject (with note) | 200 | 🔲 |
| POST /admin/donations/:id/reject (no note) | 400 | 🔲 |
| DB side-effect: currentAmount incremented on approve | confirmed | 🔲 |

## Final Gate

| Test | Expected | Result |
|---|---|---|
| pnpm lint | 0 errors, 0 warnings | 🔲 |
| pnpm build | success | 🔲 |
| Swagger docs at /api-docs | all endpoints visible | 🔲 |
| API-ROADMAP.md updated | Phase 4 ✅ | 🔲 |
