# Task Brief — F5.2–F5.6: Admin Approval Queues

## User Story

> As an admin, I want to review and approve/reject pending pets, workspaces, campaigns,
> donations, and follow-up submissions from a central panel.

## Scope

5 queue pages, all following the same pattern: list with status filter → approve/reject actions.

| Page | Route | List API | Approve | Reject |
|---|---|---|---|---|
| F5.2 Pets | `/admin/pets` | `GET /api/admin/workspaces/:id/pets` (status filter) | `POST /api/admin/pets/:id/approve` | `POST /api/admin/pets/:id/reject` |
| F5.3 Workspaces | `/admin/workspaces` | `GET /api/admin/workspaces` | `POST /api/admin/workspaces/:id/approve` | `POST /api/admin/workspaces/:id/reject` |
| F5.4 Campaigns | `/admin/campaigns` | `GET /api/admin/campaigns` | `POST /api/admin/campaigns/:id/approve` | `POST /api/admin/campaigns/:id/reject` |
| F5.5 Donations | `/admin/donations` | `GET /api/admin/donations` | `POST /api/admin/donations/:id/approve` | `POST /api/admin/donations/:id/reject` |
| F5.6 Follow-ups | `/admin/follow-ups` | `GET /api/admin/follow-up-submissions` | `POST /api/admin/follow-up-submissions/:id/approve` | `POST /api/admin/follow-up-submissions/:id/reject` |

All reject endpoints require `{ reviewNote: string }` body.

## Acceptance criteria

- [ ] All 5 queue pages load with items
- [ ] Approve action works (toast success, item removed/updated)
- [ ] Reject action works with reviewNote (dialog, toast, item updated)
- [ ] Status filter tabs on each page
- [ ] Pagination
- [ ] `pnpm lint` passes, `pnpm build` succeeds

## Complexity

**Medium** — 5 pages but all same pattern. Build one, clone four.
