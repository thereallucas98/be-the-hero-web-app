# Frontend Plan — Complete Pet Flow

**Date**: 2026-03-24
**Phase**: PLANNING
**Status**: Pending Approval

---

## Objective

Wire the complete pet flow frontend to the backend APIs already in place.
Backend is 100% done. This plan covers all missing pages, components, and API connections.

---

## Architecture

```
(workspace)/workspaces/[id]/
  layout.tsx              ← update sidebar nav items
  pets/
    page.tsx              ← F.1: pet list (server component)
    new/page.tsx          ← F.2: wire add-pet-form to API (client)
    [petId]/page.tsx      ← F.3: pet detail + manage images/requirements

(public)/pets/
  page.tsx                ← F.4: add sex filter (server component, minor)
  [id]/page.tsx           ← F.4: fire VIEW_PET + CLICK_WHATSAPP events

components/features/pets/
  pet-status-badge.tsx    ← new primitive (DRAFT/PENDING/APPROVED/REJECTED/ADOPTED)
  workspace-pet-card.tsx  ← new: list card for workspace pet management
  add-pet-form.tsx        ← update: wire to API
  pet-image-manager.tsx   ← new: add/remove/set-cover images (workspace)
  pet-requirement-manager.tsx ← new: add/delete requirements (workspace)
  pet-track-events.tsx    ← new: client component that fires track events on mount

components/features/workspaces/
  workspace-sidebar.tsx   ← update: add nav items (Pets, Interesses, etc.)
```

---

## Sub-steps

### F.1 — Workspace Pet List

**What:**
- Update `WorkspaceSidebar` with nav items: Pets, Interesses, Adoções, Configurações
- Create `PetStatusBadge` (`components/features/pets/pet-status-badge.tsx`)
- Create `WorkspacePetCard` (`components/features/pets/workspace-pet-card.tsx`)
- Create `(workspace)/workspaces/[id]/pets/page.tsx`
  - Server component — calls `GET /api/workspaces/:id/pets` directly via use case
  - Renders list of `WorkspacePetCard` with status badge, name, cover, "Adicionar pet" CTA
  - Status filter tabs (All / Draft / Pending / Approved / Rejected)

**shadcn components:** `Badge`, `Tabs`

**API:** `GET /api/workspaces/:id/pets?status=&page=`

---

### F.2 — Wire Add Pet Form

**What:**
- Update `AddPetForm` to POST to `/api/workspaces/:id/pets`
- After pet created → POST each requirement to `/api/pets/:id/requirements`
- On success → redirect to `workspaces/:id/pets/:petId`
- On error → `setError('root', ...)` with API message
- Apply `PhoneInput`/`CepInput` etc. in register workspace form (already built) — note: `AddPetForm` has no masked fields, but phone/cep will be used in workspace settings (F4.7)

**shadcn components:** `Form`, `FormField`, `FormItem`, `FormMessage` (from `components/ui/form.tsx`)

**API:**
- `POST /api/workspaces/:id/pets` → creates pet, returns `{ id }`
- `POST /api/pets/:id/requirements` → one call per requirement

---

### F.3 — Workspace Pet Detail

**What:**
- Create `(workspace)/workspaces/[id]/pets/[petId]/page.tsx`
  - Server component — calls `GET /api/pets/:id` via use case, shows `notFound()` if missing
  - Renders: name, description, status badge, attribute chips, requirements list, images grid
- Create `PetImageManager` (`components/features/pets/pet-image-manager.tsx`) — client
  - URL input + "Adicionar" button → `POST /api/pets/:id/images`
  - Remove image → `DELETE /api/pets/:id/images/:imageId`
  - Set as cover → `PATCH /api/pets/:id/images/:imageId` (`{ isCover: true }`)
- Create `PetRequirementManager` (`components/features/pets/pet-requirement-manager.tsx`) — client
  - Inline add row → `POST /api/pets/:id/requirements`
  - Remove row → `DELETE /api/pets/:id/requirements/:reqId`
- Submit for review button → `POST /api/pets/:id/submit-for-review` (only shows when status = DRAFT)

**shadcn components:** `Badge`, `Separator`, `Dialog` (confirm delete), `Tooltip`

**API:**
- `GET /api/pets/:id` (server-side)
- `POST /api/pets/:id/images`
- `PATCH /api/pets/:id/images/:imageId`
- `DELETE /api/pets/:id/images/:imageId`
- `POST /api/pets/:id/requirements`
- `DELETE /api/pets/:id/requirements/:reqId`
- `POST /api/pets/:id/submit-for-review`

---

### F.4 — Public enhancements (sex filter + event tracking)

**What:**
- Add `sex` filter to `PetFilterSidebar` (new `FilterSelect` row: Todos / Macho / Fêmea)
- Create `PetTrackEvents` (`components/features/pets/pet-track-events.tsx`) — tiny client component
  - `useEffect` on mount → fires `POST /api/pets/:id/track` with `{ type: 'VIEW_PET' }` (fire-and-forget)
  - Receives `onWhatsAppClick` callback → fires `CLICK_WHATSAPP` event before opening WA link
- Import `PetTrackEvents` in `(public)/pets/[id]/page.tsx`

**shadcn components:** none new

**API:**
- `POST /api/pets/:id/track` (`{ type: 'VIEW_PET' | 'CLICK_WHATSAPP' }`)

---

## Execution Order

```
F.1 → sidebar nav + PetStatusBadge + WorkspacePetCard + pet list page
F.2 → wire add-pet-form
F.3 → workspace pet detail + image manager + requirement manager
F.4 → sex filter + event tracking
```

Each step ends with a QA gate before proceeding to the next.

---

## Component Placement Rules

```
components/ui/
  masked-input.tsx        ← ✅ done

components/features/pets/
  pet-status-badge.tsx    ← F.1 (domain primitive, reused in F.3)
  workspace-pet-card.tsx  ← F.1 (workspace-specific list card)
  add-pet-form.tsx        ← F.2 (existing, update)
  pet-image-manager.tsx   ← F.3 (workspace-specific)
  pet-requirement-manager.tsx ← F.3 (workspace-specific)
  pet-track-events.tsx    ← F.4 (public detail)

components/features/workspaces/
  workspace-sidebar.tsx   ← F.1 (update nav items)
  workspace-header-banner.tsx ← ✅ done
```
