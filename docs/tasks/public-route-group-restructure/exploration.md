# Exploration — Public Route Group Restructure

## Current structure

```
app/
  layout.tsx                          ← root: font, QueryProvider, Toaster
  (public)/
    layout.tsx                        ← SiteHeader + SiteFooter wrapper
    page.tsx                          ← / (landing)
    pets/
      page.tsx                        ← /pets (listing)
      [id]/
        page.tsx                      ← /pets/[id] (detail — has own sidebar)
    workspaces/
      [id]/
        page.tsx                      ← /workspaces/[id] (detail — has own sidebar)
    campaigns/
      page.tsx                        ← /campaigns (stub)
    sobre-bethehero/
      page.tsx                        ← /sobre-bethehero
```

## Problem

`(public)/layout.tsx` wraps **all** public pages with `SiteHeader` + `SiteFooter`.
Detail pages (`pets/[id]`, `workspaces/[id]`) render their own full-screen sidebar with `LogoIcon` →
three logos visible simultaneously.

## Target structure

```
app/
  layout.tsx                          ← unchanged
  (public)/
    (marketing)/
      layout.tsx                      ← SiteHeader + SiteFooter (moved here)
      page.tsx
      pets/page.tsx
      campaigns/page.tsx
      sobre-bethehero/page.tsx
    (detail)/
      layout.tsx                      ← bare: just {children}
      pets/[id]/page.tsx
      workspaces/[id]/page.tsx
```

`(public)/layout.tsx` → deleted (no longer needed at this level).

## Key facts

- Route groups (`(name)`) are invisible to the URL — all paths stay the same
- Next.js App Router: a segment can have at most one `layout.tsx`; nested groups each get their own
- No page file content changes — only file locations change
- No import path changes — all imports use `~/` alias (absolute), unaffected by folder moves
- `(public)/layout.tsx` currently exports both a named `PublicLayout` and a `default` — only `default` matters to Next.js; the named export can be dropped when we move it

## Risks

- **None significant** — pure structural move, no logic changes
- Build will catch any missed file if a route breaks
