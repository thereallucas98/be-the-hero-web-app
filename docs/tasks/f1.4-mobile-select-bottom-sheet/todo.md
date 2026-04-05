# TODO: Mobile Select as Bottom Sheet

**Date**: 2026-04-05
**Phase**: EXECUTION
**Status**: IN_PROGRESS

---

## Implementation Checklist

### Step 1: `useMediaQuery` hook

- [ ] **1.1** Create `apps/web/src/hooks/use-media-query.ts` with SSR-safe `useMediaQuery(query: string): boolean`

### Step 2: `AdaptiveSelect` component

- [ ] **2.1** Create `apps/web/src/components/ui/adaptive-select.tsx`
- [ ] **2.2** Implement generic props interface `AdaptiveSelectProps<TOption, TValue extends string>`
- [ ] **2.3** Implement desktop path — standard Radix `<Select>` compound
- [ ] **2.4** Implement mobile path — `<Sheet side="bottom">` with option buttons
- [ ] **2.5** Selected option highlight (Check icon + tinted bg) in Sheet list
- [ ] **2.6** `sheetContentClassName` forwarded for brand theming
- [ ] **2.7** `triggerClassName` applied to both desktop trigger and mobile button

### Step 3: Wire `pet-filter-sidebar.tsx`

- [ ] **3.1** Import `AdaptiveSelect` in `pet-filter-sidebar.tsx`
- [ ] **3.2** Replace `<Select>` compound inside `FilterSelect` with `<AdaptiveSelect>`
- [ ] **3.3** Replace state picker `<Select>` in `LocationRow` with `<AdaptiveSelect>`
- [ ] **3.4** Replace city picker `<Select>` in `LocationRow` with `<AdaptiveSelect>`
- [ ] **3.5** Remove now-unused `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` imports

### Step 4: Validation

- [ ] **4.1** `pnpm lint` passes (0 warnings)
- [ ] **4.2** `pnpm build` succeeds
- [ ] **4.3** Manual QA — mobile Sheet opens for each filter
- [ ] **4.4** Manual QA — desktop dropdown unchanged
- [ ] **4.5** Fill `validation.md`

---

## Progress Notes

| Step | Status | Notes |
|------|--------|-------|
| 1.1 | ⬜ | |
| 2.1 | ⬜ | |
| 2.2 | ⬜ | |
| 2.3 | ⬜ | |
| 2.4 | ⬜ | |
| 2.5 | ⬜ | |
| 2.6 | ⬜ | |
| 2.7 | ⬜ | |
| 3.1 | ⬜ | |
| 3.2 | ⬜ | |
| 3.3 | ⬜ | |
| 3.4 | ⬜ | |
| 3.5 | ⬜ | |
| 4.1 | ⬜ | |
| 4.2 | ⬜ | |
| 4.3 | ⬜ | |
| 4.4 | ⬜ | |
| 4.5 | ⬜ | |
