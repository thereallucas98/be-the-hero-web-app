# Task Brief — F1.6: Public Campaigns Page

## User Story

> As a visitor, I want to browse active fundraising campaigns so I can discover causes to support and donate to.

## Scope

Replace the stub at `app/(public)/(marketing)/campaigns/page.tsx` with a full server-rendered campaigns listing page.

## API

`GET /api/campaigns?cityId=&workspaceId=&petId=&page=&perPage=` → `ListPublicCampaignsResult`:
```ts
{
  items: PublicCampaignItem[]   // APPROVED + active campaigns
  total: number
  page: number
  perPage: number
}

PublicCampaignItem {
  id, title, description,
  goalAmount: string, currentAmount: string, currency,
  coverImageUrl: string | null,
  endsAt: Date | null, approvedAt: Date | null,
  workspace: { id, name, type },
  pet: { id, name, species } | null
}
```

Filters supported: `cityId`, `workspaceId` (both optional, from `searchParams`).

## Acceptance Criteria

- [ ] Campaign cards: cover image (or placeholder), title, workspace name, progress bar (Radix `Progress`), amounts, deadline
- [ ] Filters: city picker + workspace name search — update URL `searchParams`, page resets to 1 on filter change
- [ ] Pagination — same pattern as `/pets` page
- [ ] Empty state when no campaigns match filters
- [ ] Page is server-rendered (filters from `searchParams`)
- [ ] `SiteHeader` + `SiteFooter` present (marketing layout)
- [ ] `pnpm lint` passes, `pnpm build` succeeds

## Out of scope

- Donation flow (future sprint)
- `petId` filter (internal/workspace use only)
- Campaign detail page

## Complexity

**Medium** — server component with filters + pagination, reuse `Progress` and design patterns from `workspace-campaigns-preview`.
