# Task Brief — F4.6: Workspace Campaign Management

## User Story

> As a workspace partner (OWNER/EDITOR), I want to create and manage fundraising campaigns,
> attach supporting documents, submit for admin review, and track donations.

## Scope

Build the workspace campaign management pages:
- Campaign list with status filter
- Create campaign form
- Edit campaign (DRAFT only)
- Submit for review
- View donations per campaign

## Pages

### F4.6.1 — Campaign list (`workspaces/[id]/campaigns/page.tsx`)
- List campaigns with status filter tabs (Todos, Rascunho, Em revisão, Aprovadas, Rejeitadas)
- Campaign card: title, goal, current amount, progress bar, status badge, dates
- "Nova campanha" button → create dialog/page

### F4.6.2 — Create campaign (Dialog)
- Form: title, description, goalAmount (BRL), optional petId select
- POST → `/api/workspaces/:id/campaigns`

### F4.6.3 — Campaign detail (`workspaces/[id]/campaigns/[campaignId]/page.tsx`)
- Campaign info (title, description, goal, current, progress, status, dates)
- Edit button (DRAFT only) → edit dialog
- Submit for review button (DRAFT + has documents)
- Documents section (list, but no upload — file upload infrastructure not built)
- Donations list (paginated)

## APIs (all implemented)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/workspaces/:id/campaigns` | GET | List campaigns |
| `/api/workspaces/:id/campaigns` | POST | Create campaign |
| `/api/campaigns/:id` | GET | Campaign detail |
| `/api/campaigns/:id` | PATCH | Update campaign |
| `/api/campaigns/:id/submit-for-review` | POST | Submit for review |
| `/api/campaigns/:id/donations` | GET | List donations |

## Acceptance criteria

- [ ] Campaign list loads with status filter
- [ ] Create campaign works
- [ ] Campaign detail shows info + donations
- [ ] Edit works for DRAFT campaigns
- [ ] Submit for review works (requires documents)
- [ ] Empty states for no campaigns / no donations
- [ ] `pnpm lint` passes, `pnpm build` succeeds

## Complexity

**High** — 2 pages, create/edit forms, multiple actions, donations list.
