# Plan — F1.5: Public Workspace Profile

## Ordered sub-steps

### Step 1 — `workspace-profile-header.tsx`
**File**: `apps/web/src/components/features/workspaces/workspace-profile-header.tsx` *(new)*

Props: `name`, `type`, `location: string | null`, `description`

Output:
- Workspace name as `<h1>`
- Type badge (`Badge` variant `secondary`) with PT-BR label map: `ONG → "ONG"`, `CLINIC → "Clínica"`, `PETSHOP → "Petshop"`
- Location chip (MapPin icon + city name) — only rendered when `location` is set
- Description paragraph

---

### Step 2 — `workspace-profile-contact.tsx`
**File**: `apps/web/src/components/features/workspaces/workspace-profile-contact.tsx` *(new)*

Props: `phone`, `whatsapp`, `emailPublic`, `website`, `instagram` — all `string | null`

Output:
- Section heading "Contato"
- WhatsApp link (`wa.me/55{digits}`) — shown when `whatsapp` is set
- Phone badge — shown when `phone` is set (and no whatsapp, or in addition)
- Email `mailto:` link — shown when `emailPublic` is set
- Website link (`target="_blank"`) — shown when `website` is set
- Instagram link — shown when `instagram` is set
- If none of the above: render "Nenhum contato disponível" muted text
- `buildWhatsAppUrl` helper (same logic as in `pets/[id]/page.tsx`)

---

### Step 3 — `workspace-pets-preview.tsx`
**File**: `apps/web/src/components/features/workspaces/workspace-pets-preview.tsx` *(new)*

Props: `workspaceId`, `pets: Array<{ id, name, coverImage: string | null }>`

Output:
- Section heading "Animais disponíveis"
- Responsive grid of `PetCard` components (transform `coverImage: string | null` → `{ url } | null`)
- "Ver todos os pets" link → `/pets?workspaceId={workspaceId}`
- Returns `null` when `pets.length === 0`

---

### Step 4 — `workspace-campaigns-preview.tsx`
**File**: `apps/web/src/components/features/workspaces/workspace-campaigns-preview.tsx` *(new)*

Props: `campaigns: Array<{ id, title, goalAmount: string, currentAmount: string, currency, coverImageUrl: string | null, endsAt: Date | null }>`

Output:
- Section heading "Campanhas ativas"
- List of campaign cards, each with:
  - Cover image (or brand-color placeholder)
  - Title
  - `Progress` (`~/components/ui/progress`) — value = `Math.min(100, Math.round((parseFloat(currentAmount) / parseFloat(goalAmount)) * 100))`
  - Progress label: "R$ {currentAmount} / R$ {goalAmount}"
  - Deadline: "Até {endsAt.toLocaleDateString('pt-BR')}" — hidden when `endsAt` is null
- Returns `null` when `campaigns.length === 0`

---

### Step 5 — `app/(public)/workspaces/[id]/page.tsx`
**File**: `apps/web/src/app/(public)/workspaces/[id]/page.tsx` *(replace stub)*

- Import + call `getPublicWorkspace(workspaceRepository, id)` — `notFound()` on failure
- Layout: same sidebar + back-button shell as `pets/[id]/page.tsx`
  - Sidebar back link → `/pets`, breadcrumb text → "Organizações parceiras"
- White card (`rounded-[20px]`, `shadow-sm`) containing:
  1. `WorkspaceProfileHeader`
  2. `Separator`
  3. `WorkspacePetsPreview` (conditional — only renders when pets > 0)
  4. `Separator` (conditional — only when pets > 0)
  5. `WorkspaceCampaignsPreview` (conditional — only renders when campaigns > 0)
  6. `Separator` (conditional — only when campaigns > 0)
  7. `WorkspaceProfileContact`

---

### Step 6 — Lint + build validation
```bash
pnpm lint    # 0 warnings
pnpm build   # must succeed
```

---

## Files changed

| Action | Path |
|---|---|
| Create | `components/features/workspaces/workspace-profile-header.tsx` |
| Create | `components/features/workspaces/workspace-profile-contact.tsx` |
| Create | `components/features/workspaces/workspace-pets-preview.tsx` |
| Create | `components/features/workspaces/workspace-campaigns-preview.tsx` |
| Replace | `app/(public)/workspaces/[id]/page.tsx` |

No repository, use-case, or schema changes needed.

## Test strategy

Manual QA via curl + browser:
- `GET /api/workspaces/:id/public` with a valid workspace ID → 200 with correct shape
- Page renders with all 4 sections when data is present
- Page hides pets section when workspace has 0 approved pets
- Page hides campaigns section when workspace has 0 active campaigns
- `notFound()` fires for unknown/inactive/unverified workspace ID → 404 page
- WhatsApp link opens correct `wa.me` URL
- "Ver todos os pets" link navigates to `/pets?workspaceId={id}`
- `pnpm lint` 0 warnings, `pnpm build` succeeds
