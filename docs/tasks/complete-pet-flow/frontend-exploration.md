# Frontend Exploration — Complete Pet Flow

**Date**: 2026-03-24
**Phase**: EXPLORATION
**Scope**: Frontend wiring for the complete pet flow (backend 100% done)

---

## What Already Exists (Frontend)

### Pages
| Route | Status | Notes |
|---|---|---|
| `(public)/pets/page.tsx` | ✅ Done | Server component, filters: cityPlaceId, ageCategory, energyLevel, size, independenceLevel, species |
| `(public)/pets/[id]/page.tsx` | ✅ Done | Server component, full detail, WhatsApp CTA — no event tracking yet |
| `(workspace)/workspaces/[id]/pets/new/page.tsx` | ✅ Template only | Form built but NOT wired to API |
| `(workspace)/layout.tsx` | ✅ Minimal | Red sidebar, no nav items |

### Components
| Component | Location | Notes |
|---|---|---|
| `PetCard` | `features/pets/pet-card.tsx` | Public listing card |
| `PetFilterSidebar` | `features/pets/pet-filter-sidebar.tsx` | Already has ageCategory, energyLevel, size, independenceLevel, species — missing `sex` |
| `PetImageGallery` | `features/pets/pet-image-gallery.tsx` | Public carousel |
| `PetAttributeCard` | `features/pets/pet-attribute-card.tsx` | Energy/size/env attribute chips |
| `PetAdoptionRequirement` | `features/pets/pet-adoption-requirement.tsx` | Read-only requirement row |
| `WorkspaceContactCard` | `features/pets/workspace-contact-card.tsx` | Contact card (public detail) |
| `PetMapBlock` | `features/pets/pet-map-block.tsx` | Google Maps embed |
| `AddPetForm` | `features/pets/add-pet-form.tsx` | Full form with Zod schema — NOT wired to API |
| `WorkspaceSidebar` | `features/workspaces/workspace-sidebar.tsx` | Red sidebar, logo, back button |
| `WorkspaceHeaderBanner` | `features/workspaces/workspace-header-banner.tsx` | Dark navy org header |

### API routes available (backend complete)
| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `/api/workspaces/:id/pets` | GET | workspace member | List pets by workspace with status filter + pagination |
| `/api/workspaces/:id/pets` | POST (via `/api/pets`) | workspace member | Create pet |
| `/api/pets/:id` | GET | none | Public pet detail |
| `/api/pets/:id` | PATCH | workspace member | Update pet |
| `/api/pets/:id/requirements` | POST | workspace OWNER/EDITOR | Add requirement |
| `/api/pets/:id/requirements/:reqId` | PATCH | workspace OWNER/EDITOR | Update requirement |
| `/api/pets/:id/requirements/:reqId` | DELETE | workspace OWNER/EDITOR | Remove requirement |
| `/api/pets/:id/submit-for-review` | POST | workspace OWNER/EDITOR | Submit pet for review |
| `/api/pets/:id/images` | POST | workspace OWNER/EDITOR | Add image (URL-based) |
| `/api/pets/:id/images/:imageId` | PATCH | workspace OWNER/EDITOR | Update image (cover, position) |
| `/api/pets/:id/images/:imageId` | DELETE | workspace OWNER/EDITOR | Remove image |
| `/api/pets/:id/track` | POST | none | Track metric event |
| `/api/pets` | GET | none | Public listing — now supports sex, size, ageCategory filters |

---

## Gaps Identified

### Missing pages
1. `(workspace)/workspaces/[id]/pets/page.tsx` — workspace pet list (does not exist)
2. `(workspace)/workspaces/[id]/pets/[petId]/page.tsx` — workspace pet detail (does not exist)

### Missing components
1. `PetStatusBadge` — shows DRAFT / PENDING_REVIEW / APPROVED / REJECTED / ADOPTED
2. `WorkspacePetCard` — card for workspace pet list (shows status badge, cover, name, actions)
3. Workspace sidebar navigation items (Pets, Interesses, etc. — currently just logo + back button)

### Missing wiring
1. `AddPetForm` — not wired to API (template only)
2. Pet detail page — no event tracking (VIEW_PET, CLICK_WHATSAPP)
3. Public pet listing — missing `sex` filter

### Missing auth guard
- `(workspace)` layout has no auth check — anyone can hit workspace routes

---

## Tech Patterns in Use

- **Server components** for page-level data fetching (`await use-case(repo, ...)`)
- **Client components** for interactivity (forms, filter sidebar)
- **Direct server-side use case calls** — not via HTTP for SSR pages
- **`fetch` API** — client-side mutations (create/update/delete)
- **React Hook Form + Zod** — all forms
- **shadcn/ui** — Select, Sheet, Dialog, Badge, etc.
- **No React Query** — mutations are plain `fetch` + router.refresh()
