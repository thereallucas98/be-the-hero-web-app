# Exploration — Mobile Select as Bottom Sheet

**Date**: 2026-04-05
**Status**: Complete

---

## Current State

### No `useMediaQuery` hook exists
`apps/web/src/hooks/` does not exist. No responsive JS utility anywhere in the codebase. Need to create both the directory and the hook from scratch.

### `select.tsx` — standard Radix compound component
`apps/web/src/components/ui/select.tsx`
- Exports: `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectLabel`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`
- `SelectContent` uses `position="popper"` (floating, anchored to trigger) with fade/zoom animation
- No responsive behaviour — always renders a floating dropdown regardless of viewport
- Uses `forwardRef` throughout (React 18 style)

### `sheet.tsx` — bottom sheet ready
`apps/web/src/components/ui/sheet.tsx`
- `side="bottom"` already has `slide-in-from-bottom` / `slide-out-to-bottom` with `ease-in-out duration-500`
- `@plugin "tailwindcss-animate"` now active (fixed in F1.3) — animations work
- Built-in `XIcon` close button at `top-4 right-4`

### Call sites — 6 files use `<Select>`

| File | # Selects | Pattern | Context |
|------|-----------|---------|---------|
| `pet-filter-sidebar.tsx` | 7 | `value` + `onValueChange` (no RHF) | Filter sidebar |
| `add-pet-form.tsx` | 7 | RHF `<Controller>` → `onValueChange` + `value` | Add pet form |
| `workspace-location-form.tsx` | 2 | RHF `<Controller>` | State + city pickers |
| `workspace-members-panel.tsx` | 1 | RHF `<Controller>` | Role select |
| `register-form.tsx` | 1+ | RHF `<Controller>` | Auth form |
| `pet-requirement-manager.tsx` | 1 | `onValueChange` + `value` | Requirement type |

All call sites use the same controlled props: `value` + `onValueChange`. This is the Radix Select API. The `AdaptiveSelect` must match it exactly.

### Props pattern at call sites
```tsx
// Without RHF
<Select value={val} onValueChange={setVal}>
  <SelectTrigger className="..."><SelectValue placeholder="..." /></SelectTrigger>
  <SelectContent>
    <SelectItem value="DOG">Cachorro</SelectItem>
  </SelectContent>
</Select>

// With RHF Controller
<Controller render={({ field }) => (
  <Select onValueChange={field.onChange} value={field.value}>
    ...
  </Select>
)} />
```

---

## Key Integration Challenge

Current `<Select>` is a **compound component** — callers compose `SelectTrigger`, `SelectContent`, `SelectItem` themselves. This gives maximum flexibility but means the mobile sheet alternative needs to know the options list up-front.

`AdaptiveSelect` must be a **self-contained, options-driven** component:
```tsx
<AdaptiveSelect
  value={val}
  onValueChange={setVal}
  options={[{ value: 'DOG', label: 'Cachorro' }]}
  placeholder="Selecione"
  label="Tipo"               // used as sheet title on mobile
  triggerClassName="..."     // pass-through for custom trigger styling
  disabled={false}
/>
```

This means **call sites that switch to `AdaptiveSelect` must pass an `options` array** instead of composing `SelectItem` children. That is a small but real change to each call site. For the initial scope (pet-filter-sidebar), this is clean. Other call sites adopt incrementally.

---

## SSR / Hydration Risk

`useMediaQuery` reads `window.matchMedia` — not available on the server. Standard mitigation: initialise state to `false` (desktop) on the server, update on the client after mount. This means on mobile devices there's a single frame where the desktop Select renders before hydration flips to the Sheet trigger. Acceptable for this use case (filter sidebar loads below the fold on mobile).

---

## Files to Create / Modify

| File | Action | Notes |
|------|--------|-------|
| `apps/web/src/hooks/use-media-query.ts` | Create | New hook + new directory |
| `apps/web/src/components/ui/adaptive-select.tsx` | Create | New ui primitive |
| `apps/web/src/components/features/pets/pet-filter-sidebar.tsx` | Modify | Replace `FilterSelect` internals + `LocationRow` selects |

---

## Risks

| Risk | Notes |
|------|-------|
| SSR flash (desktop → mobile) | One frame, acceptable. Mitigate with `suppressHydrationWarning` if needed |
| `FilterSelect` wrapper in sidebar passes custom trigger classes | `AdaptiveSelect` must accept `triggerClassName` prop |
| City picker has 50+ items | `overflow-y-auto` + `max-h` on sheet content handles this |
| RHF `field.onChange` vs `onValueChange` | Same signature `(value: string) => void` — compatible |
