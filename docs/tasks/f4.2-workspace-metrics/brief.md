# Task Brief — F4.2: Workspace Metrics Dashboard

## User Story

> As a workspace partner, I want a dashboard showing key metrics for my workspace — pet counts,
> views, WhatsApp clicks, interests, adoptions, and donations raised.

## Scope

Single page at `app/(workspace)/workspaces/[id]/dashboard/page.tsx` with KPI cards.

## API

`GET /api/workspaces/:id/metrics` returns:
```ts
{
  totalPets: number
  petsByStatus: Record<string, number>
  totalViews: number
  totalWhatsappClicks: number
  totalInterests: number
  totalAdoptions: number
  totalDonationsRaised: string
}
```

## Acceptance criteria

- [ ] Dashboard loads with KPI cards
- [ ] Pets by status breakdown
- [ ] Sidebar nav item for dashboard
- [ ] `pnpm lint` passes, `pnpm build` succeeds

## Complexity

**Low** — single page, one API, KPI cards (same pattern as admin dashboard).
