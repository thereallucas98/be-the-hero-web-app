# Frontend UI Build Workflow

> This document describes the step-by-step process for building new platform screens UI-first from Figma.
> Follow this for every sprint (F2–F5). API wiring happens **after** the UI is rendering correctly.

---

## Figma MCP setup

Use the **`figma-desktop` MCP** — it authenticates through the local Figma desktop app session.

```
Tool prefix: mcp__figma-desktop__
Key tools:
  get_design_context  → full node tree + styles + layout
  get_screenshot      → visual confirmation of a node
  get_variable_defs   → design tokens (colors, spacing)
```

If the MCP is disconnected, run `/mcp` in Claude Code to reconnect.

**Do NOT use `mcp__FrameLink_Figma_MCP__`** unless the token is confirmed to have access to the file (it currently does not — returns 403).

---

## Per-screen build process

### Step 1 — Receive the Figma link
The user will share a Figma URL like:
```
https://www.figma.com/design/<file-id>/<file-name>?node-id=<node-id>
```

### Step 2 — Fetch the design context
```ts
mcp__figma-desktop__get_design_context({ url: "<figma-url>" })
mcp__figma-desktop__get_screenshot({ url: "<figma-url>" })
```

Read the node tree to understand:
- Layout (auto-layout direction, gap, padding, sizes)
- Typography (font, size, weight, line-height, letter-spacing)
- Colors — map to existing CSS variable names in `globals.css`
- Component boundaries — which groups are reusable

### Step 3 — Identify shared components

Before writing code, answer these questions:
- Does this **card/row/badge/avatar group** appear in other screens?
  → Extract to `components/features/<domain>/` (e.g., `PetCard`, `WorkspaceBadge`)
- Is it domain-agnostic?
  → Extract to `components/ui/` (e.g., `StatusBadge`, `ProgressBar`)
- Is it screen-specific?
  → Inline in the page file as a local sub-component

### Step 4 — Build shared components first

Write and verify each reusable component before composing the page.

Component file checklist:
- [ ] `kebab-case` filename
- [ ] Named export only
- [ ] `data-slot="name"` on root element
- [ ] CSS variable colors (`bg-background`, `text-foreground`, etc.) — never hardcoded hex
- [ ] `cn()` for className merging
- [ ] `cva()` for variants (if multiple visual states exist)
- [ ] `focus-visible` on interactive elements
- [ ] `aria-label` on icon-only buttons

### Step 5 — Compose the page with static/mock data

Build the page layout using static data or typed mock objects. No API calls yet.

```tsx
// Example: stub data while building UI
const mockPets: Pet[] = [
  { id: '1', name: 'Rex', age: 2, ... },
]
```

### Step 6 — Verify visually

- Check desktop + mobile breakpoints
- Compare against Figma screenshot
- Confirm spacing, typography, colors match Figma tokens

### Step 7 — Wire API

Replace mock data with real data fetching:
- **Server component**: `await fetch(...)` or direct Prisma via repository
- **Client component**: `useQuery(...)` from React Query
- **Hybrid**: RSC prefetch + `HydrationBoundary`

---

## Component placement guide

```
components/ui/                    ← domain-agnostic (Button, Badge, Card, Avatar, Dialog…)
components/features/pets/         ← PetCard, PetStatusBadge, PetFilters, PetCarousel…
components/features/workspaces/   ← WorkspaceCard, WorkspaceBadge, WorkspaceHeader…
components/features/campaigns/    ← CampaignCard, DonationProgress, CampaignFilters…
components/features/interests/    ← InterestRow, InterestStatusBadge…
components/features/adoptions/    ← AdoptionTimeline, FollowUpForm…
components/features/nav/          ← SiteHeader, SidebarNav, MobileMenu, BreadcrumbNav…
components/features/landing/      ← F1 only — HeroSection, FeaturesSection, etc.
```

---

## Sprint → screen mapping

| Sprint | Description | Figma nodes | Status |
|---|---|---|---|
| F1 | Landing page | `57:3`, `57:321`, `26:3`, `26:29` | ✅ Done |
| F2 | Auth (login, register) | `1213:199`, `1213:4` | 🔲 |
| F3 | Guardian portal | TBD | 🔲 |
| F4 | Workspace portal | `1256:5`, `308:3` | 🔲 |
| F5 | Admin panel | TBD | 🔲 |

---

## Key learnings from F1 build

### Isometric CSS transforms
```css
/* Card body — skew into isometric perspective */
transform: rotate(30deg) skewX(-30deg) scaleY(0.87)

/* Counter-transform — keeps content upright on card surface */
transform: rotate(-30deg) skewX(30deg) scaleY(0.87)
```

### CSS replaced-element sizing (img inset bug)
Applying `inset` (top/right/bottom/left) directly to an `<img>` lets the browser use the SVG's intrinsic aspect ratio to resolve height, overriding `bottom` and causing stretching.

**Fix**: wrapper `<div>` with inset styles (block element → deterministic `width = parent − left − right`, `height = parent − top − bottom`) + `<img className="absolute block size-full max-w-none">` inside.

### overflow-hidden placement for floated illustrations
When a child must simultaneously overflow above AND below a parent:
- Remove `overflow-hidden` from the parent
- Use explicit `height` and `paddingTop` on the wrapper to accommodate the overflow
- Place `overflow-hidden` on a wider ancestor (e.g., `<section>`) to clip only the sides
