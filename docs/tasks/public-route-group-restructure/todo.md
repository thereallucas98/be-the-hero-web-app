# Todo — Public Route Group Restructure

- [ ] Step 1: Create `(public)/(marketing)/layout.tsx` with SiteHeader + SiteFooter
- [ ] Step 2: Move marketing pages to `(public)/(marketing)/`
  - [ ] `page.tsx` (landing)
  - [ ] `pets/page.tsx` (listing)
  - [ ] `campaigns/page.tsx`
  - [ ] `sobre-bethehero/page.tsx`
- [ ] Step 3: Create `(public)/(detail)/layout.tsx` (bare)
- [ ] Step 4: Move detail pages to `(public)/(detail)/`
  - [ ] `pets/[id]/page.tsx`
  - [ ] `workspaces/[id]/page.tsx`
- [ ] Step 5: Delete `(public)/layout.tsx` and empty dirs
- [ ] Step 6: `pnpm lint` + `pnpm build` — verify all routes present
