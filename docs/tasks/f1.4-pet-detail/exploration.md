# F1.4 Pet Detail — EXPLORATION

**Date**: 2026-04-05
**Phase**: EXPLORATION
**Status**: COMPLETE

---

## Current Architecture

### Page — `app/(public)/pets/[id]/page.tsx`
Server component. Calls `getPetDetail(petRepository, id)` → renders gallery, 3 attribute cards (energy, environment, size), map block, workspace contact, requirements list, WhatsApp CTA.

**Already rendered:** `energyLevel`, `environment`, `size`
**Fetched but unused:** `independenceLevel`, `ageCategory`, `sex`
**Not implemented:** VIEW_PET tracking, CLICK_WHATSAPP tracking, interest button

### Auth in server components — `lib/get-server-principal.ts`
`getServerPrincipal()` reads `bth_access` cookie via `next/headers`, verifies JWT, queries DB. Returns `{ userId, role, memberships, adminCities }` or `null`. This is the correct function to use in the server page to determine whether to show/disable the interest button.

### Track API — `POST /api/pets/:id/track`
No auth required. Body: `{ type: 'VIEW_PET' | 'CLICK_WHATSAPP' }`. Returns 204. Fire-and-forget from client.

### Interest API — `POST /api/pets/:id/interests`
Requires `GUARDIAN` role (httpOnly cookie auth). Returns 201 on success, or error codes:
- `UNAUTHENTICATED` → 401
- `FORBIDDEN` → 403 (non-GUARDIAN)
- `PET_ALREADY_ADOPTED` / `PET_NOT_APPROVED` / etc. → 409

### Toast — `sonner`
Already wired: `<Toaster />` in root `layout.tsx`. Usage: `import { toast } from 'sonner'` then `toast.success(...)` / `toast.error(...)`. Confirmed in `submit-for-review-button.tsx` (good reference for the interest button pattern).

### `PetAttributeCard` + indicators
- `DotIndicator` — 1–3 filled circles (used for `size`)
- `EnergyIndicator` — 3 rising bars (used for `energyLevel`)
- Both indicators are exported from `pet-attribute-card.tsx`
- `independenceLevel` maps cleanly to `DotIndicator` (LOW=1, MEDIUM=2, HIGH=3)
- `ageCategory` and `sex` have no visual scale — a static icon from `lucide-react` is sufficient

---

## Key Integration Points

### Passing auth state to client
The page is a server component → can call `getServerPrincipal()` → pass `userRole: string | null` as a prop to `PetDetailClient`. This avoids any client-side auth fetch.

### `PetDetailClient` props needed
```ts
{
  petId: string
  waUrl: string | null       // pre-computed WhatsApp URL
  userRole: string | null    // from getServerPrincipal()
}
```

### WhatsApp CTA refactor
Currently an `<a href={waUrl}>`. Needs to become a button/link that:
1. Fires `CLICK_WHATSAPP` track event (fire-and-forget)
2. Then opens the URL (`window.open` or `<a>` click)

Cleanest approach: keep the `<a>` but add an `onClick` handler via `PetDetailClient`.

### Interest button states
| Condition | UI |
|---|---|
| `userRole === null` | Button enabled → click redirects to `/login?redirectTo=/pets/:id` |
| `userRole === 'GUARDIAN'` | Button enabled → calls API → success toast + disable |
| Any other role | Button disabled + tooltip: "Apenas guardiões podem registrar interesse" |
| Already submitted (409) | Toast: "Você já registrou interesse neste animal" |

---

## Files to Touch

| File | Change |
|---|---|
| `app/(public)/pets/[id]/page.tsx` | Add missing attribute cards; call `getServerPrincipal()`; render `PetDetailClient` |
| `components/features/pets/pet-detail-client.tsx` | New — tracking + interest button |

---

## Risks / Notes

- `getServerPrincipal()` hits the DB — add it to the `Promise.all` block already on the page to keep it parallel with `getPetDetail`
- The WhatsApp CTA is currently hardcoded green `bg-[#3cdc8c]` — keep as-is, just add the `onClick` tracker
- No `Tooltip` component confirmed in `components/ui/` — use a plain `title` attribute for the disabled button explanation, or check if `tooltip.tsx` exists (it does, per the glob earlier)
