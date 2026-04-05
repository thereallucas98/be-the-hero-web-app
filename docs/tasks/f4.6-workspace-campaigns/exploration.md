# Exploration — F4.6: Workspace Campaign Management

## Current state

No campaign pages exist under `(workspace)`. Sidebar has no "Campanhas" nav item yet.

## Existing components

- `components/features/campaigns/campaign-card.tsx` — public campaign card (used in F1.6)
- `components/features/campaigns/campaign-filter-bar.tsx` — public filter bar

These are for the public campaigns page; workspace management needs its own card with status badges and edit actions.

## APIs — all implemented

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/workspaces/:id/campaigns` | GET | List workspace campaigns (paginated, status filter) |
| `/api/workspaces/:id/campaigns` | POST | Create campaign |
| `/api/campaigns/:id` | GET | Campaign detail (with documents, workspace, pet) |
| `/api/campaigns/:id` | PATCH | Update campaign (DRAFT only) |
| `/api/campaigns/:id/submit-for-review` | POST | Submit for review (requires documents) |
| `/api/campaigns/:id/donations` | GET | List donations (paginated) |
| `/api/campaigns/:id/documents` | POST | Add document (file upload — out of scope) |

## Data shapes

```ts
CampaignItem { id, workspaceId, petId, title, description, goalAmount, currentAmount, currency, coverImageUrl, status, startsAt, endsAt, createdAt }

CampaignDetailItem extends CampaignItem { documents: CampaignDocumentSummary[], workspace, pet }

CampaignDocumentSummary { id, type, title, status }
```

## Campaign statuses

`DRAFT` → `PENDING_REVIEW` (after submit) → `APPROVED` / `REJECTED`

- Only DRAFT campaigns can be edited
- Submit requires at least 1 document
- Document upload infrastructure not built — show read-only list

## Auth

OWNER/EDITOR can create/edit/submit. FINANCIAL can view.

## Risks

- Document upload not available — show info message
- `goalAmount`/`currentAmount` returned as strings (Prisma Decimal) — need `Number()` conversion
