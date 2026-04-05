# Mobile Select as Bottom Sheet — PLAN

**Date**: 2026-04-05
**Phase**: PLANNING
**Status**: AWAITING APPROVAL

---

## Architecture Overview

Three deliverables in strict dependency order:

```
Step 1: useMediaQuery hook
    ↓
Step 2: AdaptiveSelect<TOption, TValue> component
    ↓
Step 3: pet-filter-sidebar.tsx wiring
    ↓
Step 4: QA
```

---

## Sub-steps

### Step 1 — `useMediaQuery` hook
**File**: `apps/web/src/hooks/use-media-query.ts` *(new)*

- Create `apps/web/src/hooks/` directory (implicit via file creation)
- Export `useMediaQuery(query: string): boolean`
- Default `false` on server (SSR-safe)
- `useEffect` attaches `matchMedia` listener, cleans up on unmount
- No dependencies beyond React

---

### Step 2 — `AdaptiveSelect<TOption, TValue>` component
**File**: `apps/web/src/components/ui/adaptive-select.tsx` *(new)*

**Props interface:**
```ts
interface AdaptiveSelectProps<TOption, TValue extends string> {
  options: TOption[]
  getOptionValue: (option: TOption) => TValue
  getOptionLabel: (option: TOption) => string
  value: TValue | undefined
  onValueChange: (value: TValue) => void
  placeholder?: string
  label?: string              // Sheet title on mobile
  disabled?: boolean
  triggerClassName?: string   // forwarded to both desktop trigger + mobile button
  sheetContentClassName?: string
}
```

**Desktop path (≥ 1024px):**
- Renders standard Radix `<Select>` + `<SelectTrigger>` + `<SelectContent>` + `<SelectItem>` per option
- `triggerClassName` forwarded to `<SelectTrigger>`

**Mobile path (< 1024px):**
- `<Sheet>` with `side="bottom"`
- Trigger: `<SheetTrigger asChild>` wrapping a `<button>` styled with `triggerClassName` — visually identical to desktop trigger (same chevron, same text)
- Content: `SheetHeader` with `SheetTitle={label}`, then scrollable list of `<SheetClose asChild><button>` per option
- Selected option: `Check` icon on the right + subtle highlight
- `sheetContentClassName` forwarded to `<SheetContent>` for theming (brand colours in sidebar)

**Key implementation details:**
- `'use client'` directive required (uses `useMediaQuery` + Sheet/Select which are client components)
- `value || undefined` passed to Radix `<Select>` to avoid empty-string issues
- `data-slot="adaptive-select"` on root element per CLAUDE.md component checklist
- `focus-visible` on mobile trigger button
- `aria-label` not needed (label is visible text via `SheetTitle` / trigger content)

---

### Step 3 — Wire `pet-filter-sidebar.tsx`
**File**: `apps/web/src/components/features/pets/pet-filter-sidebar.tsx` *(modify)*

**`FilterSelect` internal update:**
Replace the `<Select>` compound inside `FilterSelect` with `<AdaptiveSelect>`:
```tsx
// Before: manual FILTER_ALL sentinel + compound Select
// After: same FILTER_ALL sentinel, but delegate to AdaptiveSelect
<AdaptiveSelect
  options={options}
  getOptionValue={(o) => o.value}   // options already have { value, label }
  getOptionLabel={(o) => o.label}
  value={value === '' ? FILTER_ALL : value}
  onValueChange={(v) => onChange(v === FILTER_ALL ? '' : v)}
  placeholder={...}
  label={label}
  triggerClassName="font-nunito bg-brand-primary-dark ..."
  sheetContentClassName="bg-brand-primary [&>button]:text-white"
/>
```

**`LocationRow` state/city selects:**
Replace both inline `<Select>` compounds with `<AdaptiveSelect>`:
- State picker: `options={states}`, `getOptionValue={(s) => s.id}`, `getOptionLabel={(s) => s.code ?? s.name}`
- City picker: `options={cities}`, `getOptionValue={(c) => c.id}`, `getOptionLabel={(c) => c.name}`
- Both get same brand `triggerClassName` and `sheetContentClassName`

---

## Files to Change

| File | Action |
|------|--------|
| `apps/web/src/hooks/use-media-query.ts` | Create |
| `apps/web/src/components/ui/adaptive-select.tsx` | Create |
| `apps/web/src/components/features/pets/pet-filter-sidebar.tsx` | Modify |

---

## Test Strategy

- Mobile (375px): tap each filter → Sheet slides up → tap option → value updates, Sheet closes
- Mobile: tap UF → state sheet; select PB → city sheet loads; select city → "Buscar" enables
- Desktop (1280px): click each filter → Radix dropdown opens → no Sheet involved
- Resize mid-session: desktop → mobile → Sheet; mobile → desktop → dropdown
- `pnpm lint` + `pnpm build` pass clean
