# Todo — F1.3 Pet Listing Completion

## Step 1 — Species filter
- [ ] Add `SPECIES_OPTIONS` array to `pet-filter-sidebar.tsx`
- [ ] Add `species` state initialized from searchParams
- [ ] Add species `<FilterSelect>` to `FilterPanelContent`
- [ ] Add species to mobile Sheet filters
- [ ] Include `species` in `handleSearch` URLSearchParams

## Step 2 — Pagination + bg fix
- [ ] Fix `bg-brand-primary-pale` → `bg-background` on `<main>`
- [ ] Import pagination components
- [ ] Build URL helper that preserves existing filter params
- [ ] Render `<Pagination>` below grid when `totalPages > 1`
- [ ] Pagination links: Previous, page numbers, Next

## QA
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds
- [ ] Manual QA checklist complete
- [ ] `validation.md` filled
