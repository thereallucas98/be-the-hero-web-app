# Task Brief: Mobile Select as Bottom Sheet

**Created**: 2026-04-05
**Status**: Draft
**Complexity**: Medium
**Type**: UI Change / New Feature
**Estimated Effort**: 3-5 hours

---

## Feature Overview

### User Story
As a mobile user, I want Select inputs to open as a bottom sheet instead of a floating dropdown so that I can pick options comfortably with my thumb without squinting at a tiny popup.

### Problem Statement
Radix UI's `<Select>` renders a floating dropdown that is difficult to use on small screens — it appears mid-screen, items are small, and it is hard to dismiss. On mobile the correct pattern is a bottom sheet that slides up, occupying the bottom half of the screen, with large touch targets.

### Scope

**In Scope:**
- Create a `<MobileSelect>` (or responsive `<Select>` wrapper) that renders a Radix Sheet on small viewports and the standard Radix Select on desktop
- Apply to all `<FilterSelect>` instances in `pet-filter-sidebar.tsx` (Tipo, Idade, Nível de Energia, Porte, Independência)
- Apply to the State (UF) and City pickers in `LocationRow`

**Out of Scope:**
- Migrating every existing `<Select>` call site across the app immediately — adoption is incremental; the component is ready to use anywhere
- Native `<select>` fallback
- Virtualised long lists (city picker will render all items for now)

---

## Current State

**Key Files:**
- `apps/web/src/components/ui/select.tsx` — Radix Select wrapper (standard dropdown)
- `apps/web/src/components/ui/sheet.tsx` — Radix Sheet (bottom/side slide panel)
- `apps/web/src/components/features/pets/pet-filter-sidebar.tsx` — uses `FilterSelect` + `LocationRow` with inline `<Select>`

**Current Behavior:**
All selects open a floating popover/dropdown regardless of viewport size.

**Gaps/Issues:**
- On mobile, the dropdown clips the sidebar, appears mid-screen, and is hard to tap
- No responsive behaviour exists for select inputs today

---

## Requirements

### Functional Requirements

**FR1: Responsive Select component**
- **Description**: A `<SelectBottomSheet>` (or extend existing `<Select>`) that detects viewport size and switches rendering strategy
- **Trigger**: User taps a select trigger on a mobile viewport (< lg breakpoint, ~1024px)
- **Expected Outcome**: A Sheet slides up from the bottom listing all options with large tap targets; tapping an option selects it and closes the sheet
- **Edge Cases**: Very long lists (city picker ~50+ items) must be scrollable inside the sheet

**FR2: Desktop unchanged**
- **Description**: On lg+ viewports the standard Radix Select popover renders as before
- **Trigger**: User clicks a select on desktop
- **Expected Outcome**: No visual or behavioural change from current

**FR3: Apply to pet filter sidebar**
- **Description**: All selects in `pet-filter-sidebar.tsx` use the new responsive component
- **Trigger**: Any viewport resize or mobile load
- **Edge Cases**: Sheet must inherit brand colours (white text on `bg-brand-primary`)

---

## Technical Approach

**Chosen Approach:**
Build a `<AdaptiveSelect>` primitive in `components/ui/` that:
1. Uses a `useMediaQuery` hook to detect viewport width at runtime
2. On mobile (< lg / 1024px): renders a Sheet trigger → `SheetContent side="bottom"` with a list of styled `<button>` items — large tap targets, clear selection highlight
3. On desktop (≥ 1024px): renders a polished Radix `<Select>` dropdown — consistent brand styling, smooth open/close

Single component, single props API, auto-adapts. Drop-in replacement anywhere a `<Select>` is used today.

**Alternatives Considered:**
1. **CSS-only hidden swap** — render both Select and Sheet, show one via `lg:hidden` / `hidden lg:block`. Pro: no JS media query. Con: both are mounted, Radix portals both to body, can cause focus/accessibility conflicts.
2. **Override Radix SelectContent with Sheet** — monkey-patch the content layer. Con: fragile, fights Radix internals.
3. **`useMediaQuery` hook + conditional render** — clean, explicit, standard pattern. Chosen.

**Rationale:**
Conditional render with `useMediaQuery` is the most explicit and accessible approach. It avoids double-mounting and keeps both paths fully functional.

---

## Files to Change

### New Files
- [ ] `apps/web/src/hooks/use-media-query.ts` — `useMediaQuery(query)` hook (reusable app-wide)
- [ ] `apps/web/src/components/ui/adaptive-select.tsx` — auto-adapting Select: bottom sheet on mobile, styled dropdown on desktop

### Modified Files
- [ ] `apps/web/src/components/features/pets/pet-filter-sidebar.tsx` — swap `FilterSelect` and `LocationRow` selects to use new component

---

## Acceptance Criteria

### Must Have (P0)
- [ ] **AC1**: On mobile (< 1024px), tapping any filter select opens a bottom sheet
- [ ] **AC2**: On desktop (≥ 1024px), selects behave exactly as before (Radix dropdown)
- [ ] **AC3**: Selecting an option in the sheet closes it and updates the value
- [ ] **AC4**: Sheet has white text on `bg-brand-primary` background matching sidebar style
- [ ] **AC5**: Single X close button (white) in sheet header
- [ ] **AC6**: All 5 filter selects + UF + City picker use the new component

### Should Have (P1)
- [ ] **AC7**: Sheet title shows the filter label (e.g. "Tipo", "Idade")
- [ ] **AC8**: Currently selected option is visually highlighted in the sheet list

### Could Have (P2)
- [ ] **AC9**: Search/filter input inside sheet for long lists (city picker)

---

## Test Strategy

**UI components:**
- Resize to 375px → open each filter → sheet slides up
- Tap an option → sheet closes, filter value changes, "Buscar" button enables
- Resize to 1280px → open each filter → standard dropdown appears
- Tap UF → sheet with states; select PB → city sheet loads cities

---

## Dependencies

**Blocks:** None
**Blocked By:** None (F1.3 committed)
**Related Work:** F1.3 pet listing filters
**New Libraries:** None

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `useMediaQuery` SSR mismatch (hydration) | Med | Med | Default to `false` (desktop) on server; sheet only activates client-side |
| City list too long to scroll in sheet | Low | Low | Sheet content is `overflow-y-auto` with `max-h` |
| Focus trap conflicts between Sheet + Select | Low | Med | Conditional render avoids double-mounting |

---

## Complexity Estimate

**Overall**: Medium
- Backend: None
- Frontend: Medium

**Estimated Effort**: 3-5 hours
**Confidence**: High
