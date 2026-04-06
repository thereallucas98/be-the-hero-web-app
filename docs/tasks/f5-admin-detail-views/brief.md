# Task Brief — Admin Detail Views

## User Story

> As an admin, I want to see full details of a pet, workspace, or campaign before deciding to approve or reject.

## Scope

3 detail pages + enhanced list items for donations and follow-ups:

- `/admin/pets/[id]` — Full pet info, images, requirements, workspace, approve/reject
- `/admin/workspaces/[id]` — Workspace info, type, date, approve/reject
- `/admin/campaigns/[id]` — Campaign detail with documents, goal, progress, approve/reject
- Donations — expand list item to show proof URL, payment method, full details
- Follow-ups — expand list item to show photo, message, follow-up details

## APIs

| Endpoint | Purpose |
|---|---|
| `GET /api/pets/:id` | Pet detail (public, includes images + requirements) |
| `GET /api/workspaces/:id` | Workspace detail |
| `GET /api/campaigns/:id` | Campaign detail (includes documents) |

Donations and follow-ups have enough data in the list response — no separate detail API needed.

## Acceptance criteria

- [ ] Click pet in queue → detail page with full info + approve/reject
- [ ] Click workspace → detail page + approve/reject
- [ ] Click campaign → detail page with documents + approve/reject
- [ ] Donations show expanded info inline
- [ ] Follow-ups show photo/message inline
- [ ] `pnpm lint` passes, `pnpm build` succeeds

## Complexity

**Medium** — 3 new pages, 2 enhanced list items.
