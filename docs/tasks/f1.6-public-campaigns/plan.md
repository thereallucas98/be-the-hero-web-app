# Plan — F1.6: Public Campaigns Page

## Ordered sub-steps

### Step 1 — `campaign-card.tsx`
**File**: `apps/web/src/components/features/campaigns/campaign-card.tsx` *(new)*

Props:
```ts
{
  id: string
  title: string
  description: string
  goalAmount: string
  currentAmount: string
  currency: string
  coverImageUrl: string | null
  endsAt: Date | null
  workspace: { id: string; name: string }
  pet: { id: string; name: string; species: string } | null
}
```

Output:
- Cover image (or `bg-brand-primary-pale` placeholder)
- Title (`font-nunito font-bold`)
- Workspace name with link to `/workspaces/{id}` 
- Optional pet chip ("Para: {pet.name}") when `pet` is set
- Radix `Progress` bar — value = `Math.min(100, Math.round(current/goal * 100))`
- Amounts label: formatted BRL
- Deadline: "Encerra em {date}" — hidden when `endsAt` null
- `data-slot="campaign-card"`

---

### Step 2 — Refactor `workspace-campaigns-preview.tsx`
**File**: `apps/web/src/components/features/workspaces/workspace-campaigns-preview.tsx` *(update)*

Replace inline card JSX with `<CampaignCard />` from Step 1.
Remove `formatCurrency` helper (moves to `CampaignCard`).
Keep section structure (heading + list) intact.

---

### Step 3 — `campaign-filter-bar.tsx`
**File**: `apps/web/src/components/features/campaigns/campaign-filter-bar.tsx` *(new — client component)*

Props:
```ts
{
  states: GeoStateItem[]
  initialStateId?: string
  initialCityId?: string
  initialCityName?: string
  workspaceChip?: { id: string; name: string } | null
}
```

Behaviour (mirrors F1.3 `PetFilterSidebar` location logic):
- Local state: `selectedStateId`, `selectedCityId`
- `useEffect` on `selectedStateId` → fetch cities via `GET /api/geo/cities?stateId=`
- `isDirty` useMemo: compares local state to URL `searchParams`
- "Buscar" button (disabled when `!isDirty`) → `router.push('/campaigns?cityId=...')`
- Workspace chip: shown when `workspaceChip` prop set — includes `×` button that removes `workspaceId` from URL
- Layout: horizontal `flex` row — state `AdaptiveSelect` (narrow) + city `AdaptiveSelect` (wide) + "Buscar" button
- On mobile (< 1024px): wraps to two rows; selects use bottom-sheet (handled by `AdaptiveSelect` automatically)

---

### Step 4 — `campaigns/page.tsx`
**File**: `apps/web/src/app/(public)/(marketing)/campaigns/page.tsx` *(replace stub)*

```ts
interface CampaignsPageProps {
  searchParams: Promise<{
    cityId?: string
    workspaceId?: string
    page?: string
  }>
}
```

Server logic:
1. Await `searchParams`
2. `Promise.all`:
   - `listPublicCampaigns(campaignRepository, { cityId, workspaceId, page, perPage: 12 })`
   - `listStates(geoPlaceRepository, {})` 
   - When `cityId`: `geoPlaceRepository.findCityWithState(cityId)` → resolves state + city name for filter bar
   - When `workspaceId`: `getPublicWorkspace(workspaceRepository, workspaceId)` → resolves workspace name for chip (null if not found)
3. `pageUrl(p)` helper preserving `cityId` + `workspaceId`

Layout:
- Page heading: "Campanhas ativas" + subtitle "Apoie causas animais e ajude pets que precisam de cuidados."
- Total counter: "{total} campanha(s) encontrada(s)"
- `<Suspense>` wrapping `<CampaignFilterBar />`
- Workspace chip prop passed from server
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- `EmptyState` when `items.length === 0`
- `Pagination` when `totalPages > 1` (same pattern as `/pets`)

---

### Step 5 — Lint + build validation
```bash
pnpm lint   # 0 warnings
pnpm build  # /campaigns present in route table
```

---

## Files changed

| Action | Path |
|---|---|
| Create | `components/features/campaigns/campaign-card.tsx` |
| Update | `components/features/workspaces/workspace-campaigns-preview.tsx` |
| Create | `components/features/campaigns/campaign-filter-bar.tsx` |
| Replace | `app/(public)/(marketing)/campaigns/page.tsx` |

## Test strategy (manual browser QA)

- `/campaigns` renders with total counter and card grid
- Selecting state → city → Buscar updates URL and re-fetches
- "Buscar" disabled until filter changes (`isDirty`)
- Workspace chip shown when navigating from `/workspaces/:id` → "Ver todos"
- `×` on chip removes `workspaceId` from URL
- Empty state shows when no campaigns match
- Pagination navigates between pages preserving filters
- `pnpm lint` + `pnpm build` pass
