# Research — F1.6: Public Campaigns Page

## Decision 1 — CampaignCard: extract vs inline

**Options:**
- A) Inline campaign card JSX directly in the page
- B) Extract `CampaignCard` to `components/features/campaigns/campaign-card.tsx` and refactor `WorkspaceCampaignsPreview` to use it

**Decision: B — extract CampaignCard.**

Same reasoning as F1.5 Decision 1: design for scale. `CampaignCard` will also be used in the workspace portal (F4.6) and potentially admin panel (F5.4). Extracting now and updating `WorkspaceCampaignsPreview` to consume it keeps the card in one place.

---

## Decision 2 — Filter layout: sidebar vs inline bar

**Options:**
- A) Left sidebar (same as `/pets`) — full-height sticky panel
- B) Inline filter bar at the top of the content area — compact row

**Decision: B — inline filter bar.**

The `/pets` sidebar exists because there are 6 filters (species, age, energy, size, independence, city). Campaigns has one UI filter (city). A full sidebar for a single control is disproportionate and wastes horizontal space. An inline bar above the grid is the right fit.

The bar will contain: city `AdaptiveSelect` (state → city cascade, same logic as pet filters) + workspace chip (shown/dismissible when `workspaceId` is in URL).

---

## Decision 3 — City filter state: client component vs server searchParams

**Options:**
- A) Client component with local state, pushes to URL on "Buscar" click (`isDirty` pattern from F1.3)
- B) Pure server: each city selection triggers a form submit / `<Link>` navigation

**Decision: A — client component with `isDirty` + "Buscar" button.**

Consistent with the established pattern from F1.3. Changing city without confirming doesn't re-fetch — user clicks "Buscar" to apply. The city picker itself reuses `AdaptiveSelect`.

New component: `campaign-filter-bar.tsx` in `components/features/campaigns/`.

---

## Decision 4 — Workspace filter UI: dismissible chip vs nothing

**Options:**
- A) No visible indication when `workspaceId` is in URL
- B) Show a dismissible chip "Filtrando por: {workspace name}" — requires fetching workspace name server-side

**Decision: B — dismissible chip.**

When a user arrives from a workspace profile "Ver todos" link, they need to know their results are scoped. The chip shows context and lets them remove the filter. Workspace name fetched via `getPublicWorkspace` server-side (already available).

---

## Decision 5 — Campaign grid layout

`WorkspaceCampaignsPreview` renders campaigns in a vertical list (full width). For the public page with potentially many results, a grid is better.

**Decision:** 1 column on mobile, 2 columns on `sm`, 3 columns on `lg`.
Same proportions as the pet grid.

---

## Component placement

```
components/features/campaigns/campaign-card.tsx        ← new (extracted)
components/features/campaigns/campaign-filter-bar.tsx  ← new (client)
```

`WorkspaceCampaignsPreview` updated to use `CampaignCard` internally.

---

## Summary

| Aspect | Approach |
|---|---|
| Card | Extract `CampaignCard`, refactor preview component |
| Filter layout | Inline bar (not sidebar) |
| Filter UX | Client `isDirty` + "Buscar" button, `AdaptiveSelect` for city |
| Workspace filter | URL-only, dismissible chip when active |
| Grid | 1→2→3 cols responsive |
