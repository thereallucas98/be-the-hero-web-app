# F1.4 Pet Detail — PLAN

**Date**: 2026-04-05
**Phase**: PLANNING
**Status**: APPROVED

---

## Sub-steps

### Step 1 — `PetDetailClient` component
**File**: `apps/web/src/components/features/pets/pet-detail-client.tsx` *(new)*

- `'use client'`
- Props: `petId`, `waUrl`, `userRole`
- `useEffect` fires `VIEW_PET` on mount (fire-and-forget)
- WhatsApp `<a>` with `onClick` firing `CLICK_WHATSAPP` (exact same visual as current CTA)
- "Quero adotar" button with full state machine (unauthenticated / guardian / other-role / loading / submitted)
- Toast feedback via `sonner`

### Step 2 — Update page
**File**: `apps/web/src/app/(public)/pets/[id]/page.tsx`

- Add `getServerPrincipal()` to `Promise.all`
- Add label maps for `independenceLevel`, `ageCategory`, `sex`
- Add second row of attribute cards
- Replace static WhatsApp CTA with `<PetDetailClient>`
- Import `Clock`, `User` from lucide-react; `DotIndicator` from `pet-attribute-card`

## Files to Change

| File | Action |
|------|--------|
| `apps/web/src/components/features/pets/pet-detail-client.tsx` | Create |
| `apps/web/src/app/(public)/pets/[id]/page.tsx` | Modify |

## Test Strategy
- Open `/pets/:id` → check `pet_metric_event` table for VIEW_PET row
- Click WhatsApp → check for CLICK_WHATSAPP row, URL opens
- Unauthenticated → click "Quero adotar" → redirected to login
- Login as guardian → back to pet page → click "Quero adotar" → success toast
