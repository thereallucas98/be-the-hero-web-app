# F1.4 Pet Detail — RESEARCH

**Date**: 2026-04-05
**Phase**: RESEARCH
**Status**: COMPLETE

---

## Decisions

### 1. Icons for new attribute cards

`PetAttributeCard` accepts any `ReactNode` for `icon`. Decisions:

| Attribute | Icon | Indicator |
|---|---|---|
| `independenceLevel` | `DotIndicator` (LOW=1, MEDIUM=2, HIGH=3) | Same pattern as `size` |
| `ageCategory` | `Clock` from lucide-react | Static icon, no scale |
| `sex` | `User` from lucide-react | Static icon, no scale |

`DotIndicator` and `EnergyIndicator` are already exported from `pet-attribute-card.tsx` — no new components needed.

---

### 2. Attribute card layout

Current row has up to 3 cards. Adding 3 more → two rows of up to 3, separated by `mt-3`:

```
Row 1: energyLevel | environment | size
Row 2: independenceLevel | ageCategory | sex
```

Both conditional on field presence (server returns `null` for optional fields).

---

### 3. `PetDetailClient` responsibility and props

Single client component handles everything requiring interactivity:
- `useEffect` → fire `VIEW_PET` on mount
- WhatsApp `<a>` → fires `CLICK_WHATSAPP` on click, then lets default link open
- "Quero adotar" button → interest registration

```ts
interface PetDetailClientProps {
  petId: string
  waUrl: string | null
  userRole: string | null   // null = unauthenticated
}
```

The server page calls `getServerPrincipal()` in its `Promise.all`, extracts `.role`, passes it down. No client-side auth fetch needed.

---

### 4. Tracking — fire-and-forget pattern

```ts
// VIEW_PET on mount
useEffect(() => {
  fetch(`/api/pets/${petId}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'VIEW_PET' }),
  }).catch(() => {}) // swallow — never block UI
}, [petId])

// CLICK_WHATSAPP inline on <a> onClick
onClick={() => {
  fetch(`/api/pets/${petId}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'CLICK_WHATSAPP' }),
  }).catch(() => {})
}
```

`<a>` default navigation still fires — `onClick` is purely side-effect.

---

### 5. Interest button states and UX

| State | Condition | UI |
|---|---|---|
| Unauthenticated | `userRole === null` | Green button "Quero adotar" → click redirects to `/login?redirectTo=/pets/${petId}` |
| Guardian, not submitted | `userRole === 'GUARDIAN'` | Green button "Quero adotar" → calls API |
| Guardian, submitted | after success | Disabled button "Interesse registrado ✓" (muted) |
| Non-guardian role | any other role | Disabled + `title="Apenas guardiões podem registrar interesse"` |
| Loading | during API call | Spinner + "Aguarde..." |
| 409 already registered | API returns 409 | `toast.error('Você já registrou interesse neste animal')` |

**Chosen disabled tooltip**: plain `title` attribute — matches `submit-for-review-button.tsx` pattern, no extra component overhead.

**Redirect**: `useRouter().push(...)` — `router` already needed for potential refresh after success.

---

### 6. Tooltip component availability

`components/ui/tooltip.tsx` exists (Radix `TooltipPrimitive`). Not used here — `title` attribute is simpler and sufficient for the disabled-button explanation.

---

### 7. Server page changes

Add `getServerPrincipal()` to the existing `Promise.all`:

```ts
const [result, principal] = await Promise.all([
  getPetDetail(petRepository, id),
  getServerPrincipal(),
])
```

Pass `principal?.role ?? null` to `PetDetailClient`. No additional DB call — `getServerPrincipal` is already efficient (single query).

---

## Decision Log

| Decision | Chosen | Alternative | Reason |
|---|---|---|---|
| Auth in client | Server passes `userRole` prop | Client fetches `/api/me` | Avoids extra waterfall fetch; server already has cookie access |
| Tracking | fire-and-forget fetch in useEffect / onClick | Server action | No auth needed, fire-and-forget — plain fetch is simplest |
| Disabled button hint | `title` attribute | Radix Tooltip | Matches existing codebase pattern; no new imports |
| Layout for new attrs | Second row of cards | Single expanding row | Cleaner at narrow widths; consistent card sizing |

---

## Blockers

✅ None
