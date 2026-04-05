# Exploration — F1.5: Public Workspace Profile

## Current state

`app/(public)/workspaces/[id]/page.tsx` — stub, renders "Em breve — Organização {id}".

## Key files

| File | Role |
|---|---|
| `apps/web/src/app/(public)/workspaces/[id]/page.tsx` | Target — replace stub |
| `apps/web/src/server/use-cases/workspaces/get-public-workspace.use-case.ts` | Use-case (ready) |
| `apps/web/src/server/repositories/workspace.repository.ts` | `findByIdPublic` — returns `PublicWorkspaceItem` |
| `apps/web/src/server/repositories/index.ts` | Exports `workspaceRepository` |
| `apps/web/src/server/use-cases/index.ts` | Exports `getPublicWorkspace` |
| `apps/web/src/components/features/pets/pet-card.tsx` | Reusable pet card |
| `apps/web/src/components/features/pets/workspace-contact-card.tsx` | Contact card (partial) |
| `apps/web/src/components/ui/badge.tsx` | Badge for workspace type |
| `apps/web/src/app/(public)/pets/[id]/page.tsx` | Layout reference (sidebar + back) |

## Data shape

`PublicWorkspaceItem`:
```ts
{
  id, name, type, description,
  phone, whatsapp, emailPublic, website, instagram,
  primaryLocation: { cityPlace: { id, name, slug } } | null,
  approvedPets: Array<{ id, name, species, sex, size, ageCategory, coverImage: string | null }>  // ≤6, string URL
  activeCampaigns: Array<{ id, title, goalAmount: string, currentAmount: string, currency, coverImageUrl, endsAt: Date | null }>  // ≤3
}
```

`type` values: `ONG`, `CLINIC`, `PETSHOP` (strings from Prisma enum)

## Integration points

### PetCard shape mismatch
`PetCard` expects `coverImage: { url: string } | null` (object), but `approvedPets[n].coverImage` is `string | null` (raw URL).  
→ Transform inline: `coverImage ? { url: coverImage } : null`

### WorkspaceContactCard — insufficient for this page
Existing component handles `name, address, phone, whatsapp` only. This page needs email, website, instagram too.  
→ Build new component `workspace-profile-contact.tsx` in `components/features/workspaces/` instead of reusing the pet-detail contact card.

### Campaign amounts
`goalAmount` and `currentAmount` are decimal strings (Prisma Decimal.toString()).  
→ `parseFloat(goalAmount)` / `parseFloat(currentAmount)` for progress bar arithmetic.

### Layout reference
`pets/[id]/page.tsx` uses:
- `<aside>` sticky sidebar (desktop) with `LogoIcon` + back `<Link>`  
- Mobile: inline back button row
- White card wrapper: `rounded-[20px]` + `shadow-sm`  
→ Reuse exact same shell; back link points to `/pets` on pet detail but here should point to the pets listing filtered by workspace or simply back.

### notFound
`getPublicWorkspace` returns `{ success: false, code: 'NOT_FOUND' }` → call `notFound()`.

## Risks

- **No Figma node provided** for this screen. Will build from the existing design language (colors, type scale, component library) — consistent with how pet detail was done.
- `type` values are uppercase strings — need display labels in PT-BR: `ONG → "ONG"`, `CLINIC → "Clínica"`, `PETSHOP → "Petshop"`.
- Campaign dates are `Date | null` on the server — render with `toLocaleDateString('pt-BR')`.
- If workspace has 0 pets or 0 campaigns, those sections must be hidden gracefully.
