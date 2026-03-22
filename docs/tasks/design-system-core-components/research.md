# Research — Design System & Core Components

## Key Decisions

### 1. CSS Variables — Update values, keep structure
Current `globals.css` uses Tailwind 4 `@theme inline` which works well. We keep the variable names the system already uses (`--primary`, `--background`, etc.) BUT:
- Update all color values to match Figma
- Add missing tokens: `--surface`, `--surface-raised`, `--brand-primary-pale`, `--accent-navy`, `--accent-yellow`
- Replace font: Outfit+Roboto → **Nunito** (Google Fonts via `next/font`)
- Fix border radius: `--radius-card: 16px` → `20px`, `--radius-button: 12px` → `20px`
- Fix hero text size: `48px` → `72px` desktop
- **Do NOT rename** existing vars — admin + feature components already use them and must not break

### 2. Headless Primitives — Radix UI (keep as-is)
Stack is **Radix UI + shadcn/ui patterns**. No `@base-ui/react`.
- `select.tsx` — stays on `@radix-ui/react-select`, restyled with `tv()` + Figma tokens
- `dialog.tsx` — stays on `@radix-ui/react-dialog`, restyled, bottom-sheet behavior preserved
- Avatar — stays on `@radix-ui/react-avatar`, restyled

### 3. Avatar — Keep Radix
`@radix-ui/react-avatar` stays. Restyle with `tv()` + Figma tokens (32px, brand stroke).

### 4. Button — Keep `asChild` / Radix Slot
shadcn/ui pattern keeps `asChild` via `@radix-ui/react-slot`. Restyle only.

### 5. `cn()` in `lib/utils.ts` — Keep untouched
Existing feature components (admin, workspaces, etc.) use `cn()`. We don't touch `utils.ts` or any component outside scope. New core components will use `twMerge()` directly (not `cn()`).

### 6. `label.tsx` — Rewrite, remove Radix
Currently wraps `@radix-ui/react-label`. Replace with a plain `<label>` using correct patterns.

### 7. `forwardRef` — Keep (shadcn/ui convention)
shadcn/ui uses `React.forwardRef` throughout. We keep this pattern for consistency.

### 8. Font Loading
Nunito via `next/font/google` in `layout.tsx`. Add the weights used: 400, 500, 600, 700, 800. Update `--font-sans` and `--font-display` both to point to Nunito (single font family).

### 9. Logo SVG
Download from Figma node `1:1098` (GmOkZ9Epiz0PyK2jUMHiWD). Save to `public/`. Create `logo.tsx` as a composition of `<PawIcon>` + `<LogoWordmark>` using the SVGs.

### 10. What stays unchanged
- All components outside `components/ui/`: admin, features, workspaces — untouched
- `lib/utils.ts` — untouched
- Components not in scope: skeleton, copyable-field, alert-dialog, alert, breadcrumb, date-picker, checkbox, dropdown-menu, calendar, empty, hover-card, form, item, menubar, money-input, progress, popover, pagination, radio-group, scroll-area, sheet, separator, switch, table, slider, toggle, textarea, tooltip

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Admin components break due to token changes | Only update values, not var names |
| `asChild` removal breaks existing Button usage | Search all usages; zero in existing code |
| Base UI Dialog API differs from Radix | Preserve bottom-sheet classes, just swap primitive |
| Figma rate-limit missing 5 screens | Tokens fully derived — no blocker for style guide |
