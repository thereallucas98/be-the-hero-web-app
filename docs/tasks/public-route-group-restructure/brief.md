# Task Brief — Public Route Group Restructure

## Problem

The `(public)` layout wraps every public page with `SiteHeader` + `SiteFooter`.
Detail pages (`pets/[id]`, `workspaces/[id]`) also render their own full-screen sidebar
with a `LogoIcon`, resulting in three logos on screen (header → sidebar → footer).

## Goal

Split `(public)` into two nested route groups:

- `(public)/(marketing)` — retains `SiteHeader` + `SiteFooter` (landing, listing, campaigns, etc.)
- `(public)/(detail)` — bare layout, no header/footer (pet detail, workspace profile)

URLs stay identical — route groups are invisible to the router.

## File mapping

| Current | Moves to |
|---|---|
| `(public)/layout.tsx` | `(public)/(marketing)/layout.tsx` (unchanged content) |
| `(public)/page.tsx` | `(public)/(marketing)/page.tsx` |
| `(public)/pets/page.tsx` | `(public)/(marketing)/pets/page.tsx` |
| `(public)/campaigns/page.tsx` | `(public)/(marketing)/campaigns/page.tsx` |
| `(public)/sobre-bethehero/page.tsx` | `(public)/(marketing)/sobre-bethehero/page.tsx` |
| `(public)/pets/[id]/page.tsx` | `(public)/(detail)/pets/[id]/page.tsx` |
| `(public)/workspaces/[id]/page.tsx` | `(public)/(detail)/workspaces/[id]/page.tsx` |
| *(new)* | `(public)/(detail)/layout.tsx` — `<>{children}</>` |

`(public)/layout.tsx` itself becomes empty or is removed (no longer needed at this level).

## Acceptance criteria

- [ ] All URLs unchanged (`/`, `/pets`, `/pets/[id]`, `/workspaces/[id]`, `/campaigns`, `/sobre-bethehero`)
- [ ] Marketing pages still show `SiteHeader` + `SiteFooter`
- [ ] Detail pages show NO header, NO footer — only the page's own sidebar layout
- [ ] `pnpm lint` passes, `pnpm build` succeeds
