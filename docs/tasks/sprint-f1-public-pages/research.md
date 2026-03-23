# Research — Sprint F1: Public Marketing Pages

## Key Decisions

### 1. Route group `(public)` — yes, own layout
The landing page has `bg-brand-primary` (#F15156) full-page. Other public pages (pets, campaigns) will have white bg. Using `app/(public)/layout.tsx` gives us a shared nav without locking in a background color — each page sets its own bg. The root `app/page.tsx` becomes a redirect to `/` inside the group (or we just move the page there directly since Next.js resolves both).

**Decision**: Move landing to `app/(public)/page.tsx`. Root `app/page.tsx` deleted — Next.js will resolve `(public)/page.tsx` as the `/` route automatically.

### 2. Mobile menu state — `useState` in SiteHeader
The mobile menu open/close is local UI state. No need for Zustand — it doesn't cross component boundaries. `useState` in `SiteHeader`, passed as prop to `MobileMenu`.

### 3. Pet illustration — download from Figma as PNG
Node `201:31` (OBJECTS, 592×305px) is a complex multi-layered SVG illustration. Downloading as PNG @2x is more reliable than inline SVG for this type of asset. Save to `public/images/hero-pets.png`.

### 4. Feature cards — static data, no API call
The 3 feature cards (🐕🐈🦮) are hardcoded marketing copy — not dynamic. Define as a static array inside the component. No server fetching needed.

### 5. Social proof avatars — static placeholder
The 4 avatar images in Figma are stock photos. Use `AvatarFallback` with initials for now. The "324 amigos" count is also static marketing copy for now.

### 6. `SiteHeader` — server component
No interactivity needed on the header shell itself. The hamburger button and mobile menu are client. Pattern: server `SiteHeader` wraps `'use client'` `MobileMenuTrigger`.

**Decision**: `site-header.tsx` is a server component. `mobile-menu.tsx` is `'use client'`.

### 7. Stub pages — minimal, no layout complexity
`/pets`, `/pets/[id]`, `/workspaces/[id]`, `/campaigns` each get a one-liner server component with a "Em breve" message. No client code, no imports beyond what's necessary. These will be fully replaced in later sprints.

### 8. Old `app/page.tsx` — delete
It's a placeholder with stale token references (`text-deep-navy`, `text-responsible-green`, `text-hero-orange`) that no longer exist in our token system. Delete it cleanly.

## File Structure
```
app/
  (public)/
    layout.tsx                  ← SiteHeader + children (server)
    page.tsx                    ← Landing page (server)
    pets/
      page.tsx                  ← Stub
      [id]/
        page.tsx                ← Stub
    workspaces/
      [id]/
        page.tsx                ← Stub
    campaigns/
      page.tsx                  ← Stub

components/features/
  nav/
    site-header.tsx             ← Server component
    mobile-menu.tsx             ← 'use client'
  landing/
    hero-section.tsx            ← Server component
    features-section.tsx        ← Server component

public/images/
  hero-pets.png                 ← Downloaded from Figma
```

## Risk Assessment
| Risk | Mitigation |
|---|---|
| Figma illustration node exports as empty | Use placeholder colored div with pet emoji as fallback |
| Old `page.tsx` tokens break lint | Delete it — it's a pure placeholder |
| Mobile menu animation jank | Use CSS transition on transform, not display |
