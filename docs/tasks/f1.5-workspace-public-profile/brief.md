# Task Brief — F1.5: Public Workspace Profile

## User Story

> As a guardian browsing the platform, I want to visit a workspace's public profile page
> so I can learn about the organization, see their available pets, and know how to contact them.

## Scope

Build `app/(public)/workspaces/[id]/page.tsx` — a server-rendered public profile page for partner organizations (ONGs, clinics, petshops).

Currently the route exists but renders only a placeholder ("Em breve — Organização {id}").

## API

`GET /api/workspaces/:id/public` (already implemented) → `PublicWorkspaceItem`:

```ts
{
  id, name, type, description,
  phone, whatsapp, emailPublic, website, instagram,
  primaryLocation: { cityPlace: { id, name, slug } } | null,
  approvedPets: Array<{ id, name, species, sex, size, ageCategory, coverImage }>  // up to 6
  activeCampaigns: Array<{ id, title, goalAmount, currentAmount, currency, coverImageUrl, endsAt }>  // up to 3
}
```

The use-case `getPublicWorkspace(workspaceRepository, id)` is already in place; we can call it directly (no HTTP fetch needed since this is a server component).

## Acceptance Criteria

- [ ] Header: workspace name, type badge, city/state location, description
- [ ] Available pets section: grid of up to 6 pet cards (reuse `PetCard`), "Ver todos os pets" link → `/pets?workspaceId={id}`
- [ ] Active campaigns section: up to 3 campaign cards with title, progress bar (currentAmount / goalAmount), deadline — hidden if no campaigns
- [ ] Contact info section: phone, WhatsApp (opens `wa.me/55{digits}`), email, website, instagram — each conditionally rendered
- [ ] `notFound()` when workspace is not found (404)
- [ ] Page is fully server-rendered (no `useClient` in page file)
- [ ] Matches the sidebar + back-button layout pattern used in `pets/[id]/page.tsx`
- [ ] `pnpm lint` passes (0 warnings), `pnpm build` succeeds

## Out of Scope

- Workspace verification badge (no `isVerified` field in public API yet)
- Donation flow (F1.6+)
- Edit/manage workspace (F4.7)

## Complexity

**Medium** — server component, 3 data sections, reuse existing components, no new API work needed.
