# Task Brief: F1.4 — Pet Detail Public Page (Completion)

**Created**: 2026-04-05
**Status**: Draft
**Complexity**: Simple
**Type**: UI Change / Feature Completion
**Estimated Effort**: 2-3 hours

---

## Feature Overview

### User Story
As a visitor, I want to see a pet's full profile so I can learn about it and express my adoption interest.

### Problem Statement
The pet detail page (`/pets/[id]`) is ~80% built. The page, all sub-components, and the supporting API routes all exist. Three gaps remain before F1.4 can be marked complete:

1. **Missing attributes** — `independenceLevel`, `ageCategory`, and `sex` are available in the data but not rendered
2. **No event tracking** — `POST /api/pets/:id/track` exists for `VIEW_PET` and `CLICK_WHATSAPP` but is never called
3. **No "Register interest" button** — `POST /api/pets/:id/interests` exists and requires `GUARDIAN` role auth; button is absent from the page

### Scope

**In Scope:**
- Add `independenceLevel`, `ageCategory`, and `sex` attribute cards to the page
- Fire `VIEW_PET` event on page load (client-side, fire-and-forget)
- Fire `CLICK_WHATSAPP` event when user clicks the WhatsApp CTA
- Add "Quero adotar" button that calls `POST /api/pets/:id/interests`; redirects to login if unauthenticated; shows success/error feedback

**Out of Scope:**
- Guardian portal interest history (F3.2)
- Embedding an actual map tile (PetMapBlock placeholder is acceptable for now)

---

## Current State

**Key Files:**
- `apps/web/src/app/(public)/pets/[id]/page.tsx` — page exists, renders gallery + attributes + requirements + WhatsApp CTA
- `apps/web/src/components/features/pets/pet-attribute-card.tsx` — `PetAttributeCard`, `EnergyIndicator`, `DotIndicator`
- `apps/web/src/components/features/pets/pet-image-gallery.tsx` — thumbnail carousel, complete
- `apps/web/src/components/features/pets/workspace-contact-card.tsx` — workspace name, address, phone
- `apps/web/src/components/features/pets/pet-map-block.tsx` — placeholder map + "Ver rotas" link
- `apps/web/src/app/api/pets/[id]/track/route.ts` — `POST`, accepts `{ type: 'VIEW_PET' | 'CLICK_WHATSAPP' }`, no auth required, returns 204
- `apps/web/src/app/api/pets/[id]/interests/route.ts` — `POST`, requires `GUARDIAN` role, returns 201 or error codes

**Current Behavior:**
- Energy, environment, size are rendered as attribute cards
- `independenceLevel`, `ageCategory`, `sex` are fetched but silently unused
- No metric events are fired
- No interest registration UI exists

---

## Requirements

### Functional Requirements

**FR1: Additional attribute cards**
- `ageCategory`: PUPPY→Filhote, YOUNG→Jovem, ADULT→Adulto, SENIOR→Idoso
- `sex`: MALE→Macho, FEMALE→Fêmea
- `independenceLevel`: LOW→Baixo, MEDIUM→Médio, HIGH→Alto — rendered with same dot-style indicator as `size`

**FR2: VIEW_PET tracking**
- Fire `POST /api/pets/:id/track { type: 'VIEW_PET' }` once on mount (client component, `useEffect`, fire-and-forget — don't block render or show error)

**FR3: CLICK_WHATSAPP tracking**
- Fire `POST /api/pets/:id/track { type: 'CLICK_WHATSAPP' }` when user clicks the WhatsApp button (fire-and-forget)

**FR4: "Quero adotar" interest button**
- Rendered below the WhatsApp CTA
- If unauthenticated: redirect to `/login?redirectTo=/pets/:id`
- If authenticated as GUARDIAN: call `POST /api/pets/:id/interests`, show success toast (sonner), disable button after success
- If authenticated as non-GUARDIAN (PARTNER_MEMBER, ADMIN): show disabled button with tooltip "Apenas guardiões podem registrar interesse"
- API error cases: surface via toast

---

## Technical Approach

**Chosen Approach:**
- Extract a `PetDetailClient` client component that wraps the tracking + interest button logic; the outer page remains a server component
- Pass `petId` and `workspaceId` as props to `PetDetailClient`
- `useEffect` fires `VIEW_PET` on mount
- WhatsApp `<a>` becomes a `<button>` (or `onClick` wrapper) that fires `CLICK_WHATSAPP` then opens the URL

---

## Files to Change

### New Files
- [ ] `apps/web/src/components/features/pets/pet-detail-client.tsx` — client wrapper for tracking + interest button

### Modified Files
- [ ] `apps/web/src/app/(public)/pets/[id]/page.tsx` — add missing attribute cards, render `PetDetailClient`

---

## Acceptance Criteria

### Must Have (P0)
- [ ] **AC1**: `ageCategory`, `sex`, `independenceLevel` appear as attribute cards on the page
- [ ] **AC2**: `VIEW_PET` event is recorded in DB on page load
- [ ] **AC3**: `CLICK_WHATSAPP` event is recorded when user taps "Entrar em contato"
- [ ] **AC4**: "Quero adotar" button visible; unauthenticated users redirected to login
- [ ] **AC5**: Authenticated GUARDIAN sees success toast after registering interest

### Should Have (P1)
- [ ] **AC6**: Non-guardian role sees disabled button with explanation

---

## Test Strategy

**User**: `guardian@bth.dev` (GUARDIAN role) for interest registration
**User**: any unauthenticated visitor for tracking + redirect

1. Open `/pets/:id` → check DB for VIEW_PET event
2. Click "Entrar em contato" → check DB for CLICK_WHATSAPP event, WhatsApp opens
3. Unauthenticated → click "Quero adotar" → redirected to login with `redirectTo`
4. Login as guardian → redirected back → click "Quero adotar" → success toast

---

## Dependencies

**Blocks:** None
**Blocked By:** None (all APIs exist)
**Related Work:** F3.2 guardian interest list (reads what this creates)
**New Libraries:** None (`sonner` already installed)
