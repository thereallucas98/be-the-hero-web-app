# Mobile Select as Bottom Sheet — RESEARCH

**Date**: 2026-04-05
**Phase**: RESEARCH
**Status**: COMPLETE

---

## Context

Six call sites use Radix `<Select>` across the app. On mobile, the floating dropdown is unusable. We need a single `<AdaptiveSelect>` primitive that auto-switches: bottom sheet on mobile, polished dropdown on desktop.

---

## Goals

- Design the exact component API
- Decide how to handle the empty-string value problem with Radix Select
- Decide how the mobile Sheet trigger stays visually identical to the desktop trigger
- Decide on the `useMediaQuery` implementation

---

## Technical Analysis

### 1. `useMediaQuery` hook

**Decision**: standard `useEffect` + `window.matchMedia` with server-safe default of `false`.

```ts
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false) // false = desktop (server-safe)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}
```

Query used at call site: `'(max-width: 1023px)'` (below Tailwind `lg`).

**SSR behaviour**: server renders desktop Select, client hydrates and switches to Sheet trigger on mobile. Single-frame flash is invisible in practice because the filter sidebar is below the fold on mobile.

---

### 2. Empty-string value problem

Radix Select does not accept `value=""` — it ignores it and shows the placeholder. The existing `FilterSelect` in `pet-filter-sidebar.tsx` already works around this with a `FILTER_ALL = '__all__'` sentinel.

**Decision**: keep this mapping **outside** `AdaptiveSelect`. `AdaptiveSelect` is a pure controlled component — callers pass non-empty string values or keep the sentinel pattern in their wrapper. The `FilterSelect` wrapper in `pet-filter-sidebar.tsx` remains unchanged; only its internal `<Select>` compound is replaced with `<AdaptiveSelect>`.

This means `AdaptiveSelect`:
- Never receives `value=""` from the filter sidebar (handled by `FilterSelect` wrapper)
- Works cleanly for form selects where options always have non-empty values

---

### 3. Component API — Generic `TOption` / `TValue`

`AdaptiveSelect` is **options-driven and generic**. Callers pass their own data shape and two accessor functions — no forced renaming to `{ value, label }`.

```ts
interface AdaptiveSelectProps<TOption, TValue extends string> {
  // Data
  options: TOption[]
  getOptionValue: (option: TOption) => TValue   // e.g. (o) => o.id
  getOptionLabel: (option: TOption) => string   // e.g. (o) => o.name

  // Controlled state
  value: TValue | undefined
  onValueChange: (value: TValue) => void

  // UX
  placeholder?: string
  label?: string              // Sheet title on mobile
  disabled?: boolean

  // Styling
  triggerClassName?: string       // applied to both desktop trigger + mobile button
  sheetContentClassName?: string  // theming for mobile Sheet
}
```

**Usage examples:**

```tsx
// Simple flat options (existing filter sidebar pattern)
<AdaptiveSelect
  options={SPECIES_OPTIONS}
  getOptionValue={(o) => o.value}
  getOptionLabel={(o) => o.label}
  value={species}
  onValueChange={setSpecies}
  label="Tipo"
/>

// Domain objects — no mapping needed
<AdaptiveSelect
  options={cities}
  getOptionValue={(c) => c.id}
  getOptionLabel={(c) => c.name}
  value={selectedCityId}
  onValueChange={setSelectedCityId}
  label="Cidade"
/>

// RHF Controller — same onValueChange signature, compatible
<Controller render={({ field }) => (
  <AdaptiveSelect
    options={PET_SIZE_OPTIONS}
    getOptionValue={(o) => o.value}
    getOptionLabel={(o) => o.label}
    value={field.value}
    onValueChange={field.onChange}
  />
)} />
```

**Why `TOption` + `TValue extends string`:**
- `TOption` — caller's data shape, no field name contract required
- `TValue extends string` — Radix Select and Sheet buttons both need string values; narrows the type (e.g. `'DOG' | 'CAT'` instead of plain `string`) so `onValueChange` is fully typed
- `getOptionValue` / `getOptionLabel` — same pattern as `react-select`, familiar and composable

**Why options-driven instead of compound**: the Sheet on mobile needs to know all options to render buttons. There's no way to extract option data from `<SelectItem>` children at runtime without hacky React.Children traversal.

---

### 4. Trigger visual consistency

The mobile Sheet trigger (a `<button>`) must look identical to the desktop `<SelectTrigger>`. Both receive `triggerClassName`. The mobile button renders:

```tsx
<button className={cn(defaultTriggerCls, triggerClassName)}>
  <span>{selectedLabel ?? placeholder ?? 'Selecione'}</span>
  <ChevronDown className="size-4 opacity-50" />
</button>
```

`defaultTriggerCls` mirrors `SelectTrigger`'s base classes:
```
flex h-10 w-full items-center justify-between rounded-input border border-input
bg-background px-3 py-2 text-sm whitespace-nowrap shadow-sm
focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none
disabled:cursor-not-allowed disabled:opacity-50
```

In the filter sidebar context, `triggerClassName` overrides these with brand styles (dark bg, white text, etc.) — same as today.

---

### 5. Mobile Sheet option list design

Each option renders as a full-width button with:
- Large tap target (`py-3 px-4`)
- `text-base` for readability
- Selected state: brand primary bg tint + `Check` icon on the right
- `SheetClose asChild` wrapping so tapping an option closes the sheet automatically

---

### 6. Desktop dropdown — "polished" requirement

The desktop path renders the standard Radix `<Select>` compound. No visual changes to `select.tsx` itself. The "polished" look comes from:
- Caller controlling `triggerClassName` (same as today)
- `SelectContent` already has `animate-in fade-in zoom-in` (now works with `@plugin "tailwindcss-animate"`)
- `SelectItem` already shows a `Check` icon for the selected item

No changes to `select.tsx` needed.

---

## Edge Cases

| Case | Handling |
|------|---------|
| No option matches `value` | Trigger shows `placeholder`; mobile sheet shows no check |
| Long list (50+ cities) | Sheet content is `overflow-y-auto max-h-[60dvh]` |
| `disabled` prop | Mobile button + desktop trigger both get `disabled` attribute |
| Resize desktop→mobile mid-session | `useMediaQuery` listener updates `matches`; component re-renders to Sheet mode |
| RHF `field.onChange` | Same signature as `onValueChange` — drop-in compatible |

---

## Decision Log

| Decision | Chosen | Rejected | Reason |
|----------|--------|----------|--------|
| Viewport detection | `useMediaQuery` JS hook | CSS `hidden lg:block` dual-render | Dual-render mounts both Radix portals, causing focus/a11y conflicts |
| Empty-value handling | External (caller's responsibility) | Internal sentinel | Keeps `AdaptiveSelect` generic and clean |
| Options API | Generic `TOption`/`TValue` + accessor fns | `{ value, label }[]` | No forced field renaming; full type inference on `onValueChange` |
| Desktop path | Unchanged Radix Select | Custom-built dropdown | Zero regression risk; animations now work |

---

## Blockers

✅ No blockers

---

## Next Steps

1. Write `plan.md` + `todo.md`
2. Await approval
3. Implement `use-media-query.ts` → `adaptive-select.tsx` → update `pet-filter-sidebar.tsx`
