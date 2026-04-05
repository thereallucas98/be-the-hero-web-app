# Task Brief — F5.1: Admin Layout + Dashboard

## User Story

> As an admin (ADMIN/SUPER_ADMIN), I want a panel with sidebar navigation and a metrics dashboard
> to monitor platform health and navigate to approval queues.

## Scope

- `(admin)/admin/layout.tsx` — sidebar + main content shell
- `AdminSidebar` — 8 nav items + mobile bottom nav
- `admin/dashboard/page.tsx` — platform metrics KPI cards
- Middleware update — protect `/admin/*` routes for ADMIN/SUPER_ADMIN roles

## Pages

### Layout
- Sidebar: Métricas, Pets, Workspaces, Campanhas, Doações, Follow-ups, Cobertura, Logs
- Same pattern as guardian/workspace sidebars

### Dashboard
- KPI cards: total pets, pets by status, total adoptions, total campaigns, campaigns by status, total donations raised, total active workspaces
- API: `GET /api/admin/metrics`

## Acceptance criteria

- [ ] Admin layout renders with sidebar navigation
- [ ] Dashboard shows platform metrics
- [ ] Unauthenticated → redirect to login
- [ ] Non-admin role → redirect to /
- [ ] Mobile bottom nav works
- [ ] `pnpm lint` passes, `pnpm build` succeeds

## Complexity

**Medium** — new route group, sidebar, one data page.
