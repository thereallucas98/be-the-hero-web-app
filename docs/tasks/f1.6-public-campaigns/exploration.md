# Exploration — F1.6: Public Campaigns Page

## Current state

`(public)/(marketing)/campaigns/page.tsx` — stub, renders "Em breve — Campanhas".

## Key files

| File | Role |
|---|---|
| `app/(public)/(marketing)/campaigns/page.tsx` | Target — replace stub |
| `server/use-cases/campaigns/list-public-campaigns.use-case.ts` | Ready |
| `server/repositories/campaign.repository.ts` | `listPublic` — `PublicCampaignItem` |
| `server/repositories/index.ts` | Exports `campaignRepository` |
| `server/use-cases/index.ts` | Exports `listPublicCampaigns` |
| `app/(public)/(marketing)/pets/page.tsx` | Pattern reference (searchParams, pagination) |
| `components/features/workspaces/workspace-campaigns-preview.tsx` | Existing campaign card UI to extract from |
| `components/ui/progress.tsx` | Radix Progress — already used |
| `components/ui/empty-state.tsx` | Branded empty state |
| `components/ui/pagination.tsx` | Pagination — same pattern as /pets |

## Data shape

`PublicCampaignItem`:
```ts
{
  id, title, description,
  goalAmount: string, currentAmount: string, currency,
  coverImageUrl: string | null,
  endsAt: Date | null, approvedAt: Date | null,
  workspace: { id: string; name: string; type: string },
  pet: { id: string; name: string; species: string } | null
}
```

Filters available: `cityId`, `workspaceId`, `petId` (page: 1, perPage: 20 max).

## Filter availability

**City filter** → `listCities` + `listStates` exist — full UI possible (same as /pets).

**Workspace filter** → no `listPublicWorkspaces` use-case or repository method exists.
A dropdown of all workspaces cannot be populated without adding a new repo method.
→ `workspaceId` filter accepted from URL params only (for deep-linking from workspace profile "Ver todos" link), no UI control.
→ When `workspaceId` is present in URL, fetch workspace name via `getPublicWorkspace` and show a dismissible "Filtrando por: {name}" chip.

## Reuse opportunities

- `WorkspaceCampaignsPreview` renders campaign cards already — but it's a section component (heading + list). We need a standalone `CampaignCard` that can be used in a grid on this page.
- Extract `CampaignCard` to `components/features/campaigns/campaign-card.tsx` — reused both here and in `WorkspaceCampaignsPreview`.

## Pagination pattern

`/pets` page: `pageUrl(p)` helper preserves active filters in URL. Same approach here with `cityId` + `workspaceId`.

## City filter UX

`/pets` uses `PetFilterSidebar` (full left sidebar with many filters). Campaigns only has one real filter (city). A full sidebar would be overkill — a simpler inline filter bar at the top of the page is more appropriate.

## Risks

- `endsAt` is a `Date | null` in the repository — serialized as ISO string when passed through `fetch`. Since we call the use-case directly (server component), it remains a `Date`. Safe to call `.toLocaleDateString('pt-BR')` directly.
- No workspace listing API — workspace filter UI must be deferred or needs a new repo method (out of scope for this task).
