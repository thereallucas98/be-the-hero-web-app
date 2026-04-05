# Todo — F1.6: Public Campaigns Page

## Step 1 — campaign-card.tsx
- [ ] Create `components/features/campaigns/campaign-card.tsx`
- [ ] Cover image or brand-color placeholder
- [ ] Title, workspace name (link to /workspaces/:id), pet chip (conditional)
- [ ] Radix Progress bar with percentage
- [ ] Formatted BRL amounts label
- [ ] Deadline (conditional)
- [ ] `data-slot="campaign-card"`

## Step 2 — Refactor workspace-campaigns-preview.tsx
- [ ] Import and use `CampaignCard` 
- [ ] Remove inline card JSX and `formatCurrency` helper

## Step 3 — campaign-filter-bar.tsx
- [ ] Create `components/features/campaigns/campaign-filter-bar.tsx` ('use client')
- [ ] State + city AdaptiveSelect with city fetch on state change
- [ ] `isDirty` useMemo
- [ ] "Buscar" button (disabled when !isDirty)
- [ ] Workspace chip with × dismiss button (conditional)
- [ ] Horizontal layout, wraps on mobile

## Step 4 — campaigns/page.tsx
- [ ] Replace stub with full server component
- [ ] Parallel data fetching (campaigns + states + city info + workspace name)
- [ ] `pageUrl(p)` helper preserving filters
- [ ] Page heading + subtitle + total counter
- [ ] `<Suspense>` + `<CampaignFilterBar />`
- [ ] Responsive grid
- [ ] `EmptyState` when no results
- [ ] `Pagination` when totalPages > 1

## Step 5 — Validation
- [ ] `pnpm lint` passes (0 warnings)
- [ ] `pnpm build` succeeds — `/campaigns` in route table
