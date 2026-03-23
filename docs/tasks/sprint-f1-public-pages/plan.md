# Plan — Sprint F1: Public Marketing Pages

## Sub-step 1 — Route group + layout + delete old page.tsx

Files:
- `app/page.tsx` — DELETE
- `app/(public)/layout.tsx` — NEW: imports SiteHeader, wraps children
- `app/(public)/page.tsx` — NEW: composes HeroSection + FeaturesSection

QA gate A:
- `pnpm lint && pnpm build` passes
- `localhost:3001/` renders without error (layout shell visible)

---

## Sub-step 2 — `MobileMenu` component

Files:
- `components/features/nav/mobile-menu.tsx` — NEW ('use client')
  - Props: `open: boolean`, `onClose: () => void`
  - `#E44449` bg, `rounded-b-[20px]`, absolute positioned below header
  - Nav links column (gap-3), white text, active=700 inactive=600/50%
  - Separator (white/20%), close button top-right 40×40
  - CSS transition on opacity + translateY (not display)

QA gate B:
- `pnpm lint && pnpm build` passes
- `localhost:3001/` @ 360px: hamburger visible
- Click hamburger → red dropdown with 5 links appears
- Click X → dropdown dismisses
- Click outside → dropdown dismisses

---

## Sub-step 3 — `SiteHeader` component

Files:
- `components/features/nav/site-header.tsx` — NEW (server)
  - Logo left (`<Logo />` with `className="text-white"`)
  - Desktop links center/right — hidden on mobile
  - `MobileMenuTrigger` (client island) for hamburger + state

QA gate C:
- `pnpm lint && pnpm build` passes
- Desktop (1440px): logo + 5 nav links visible, white, no hamburger
- Mobile (360px): logo + hamburger only, links hidden

---

## Sub-step 4 — Download hero illustration + `HeroSection`

Files:
- `public/images/hero-pets.png` — downloaded from Figma node `201:31`
- `components/features/landing/hero-section.tsx` — NEW (server)
  - Full-width `bg-brand-primary` section
  - Left col: hero heading (72px/44px mobile, weight-700, white, tracking-[-0.02em]), subtext, social-proof avatars row, CTA button
  - Right col: `<Image>` hero-pets.png (hidden on mobile)
  - CTA: full-width mobile / 492px desktop, `bg-brand-primary-dark`, `rounded-button`, text `text-accent-navy` font-extrabold text-xl

QA gate D:
- `pnpm lint && pnpm build` passes
- Desktop: 2-col hero, red bg, white text, illustration right
- Mobile: single col, 44px heading, full-width CTA
- Illustration visible (or colored fallback if download failed)

---

## Sub-step 5 — `FeaturesSection`

Files:
- `components/features/landing/features-section.tsx` — NEW (server)
  - White bg section
  - Section heading: "Um app não, uma caixinha de amigos..." 48px/30px mobile, weight-700, `text-accent-navy`
  - 3 feature cards: `bg-brand-primary-pale`, `rounded-card`, emoji + description text (14px/400)

QA gate E:
- `pnpm lint && pnpm build` passes
- 3 cards visible on white bg below hero
- Cards stack vertically on mobile, row on desktop
- Navy heading, correct font size

---

## Sub-step 6 — Stub pages

Files:
- `app/(public)/pets/page.tsx` — stub
- `app/(public)/pets/[id]/page.tsx` — stub
- `app/(public)/workspaces/[id]/page.tsx` — stub
- `app/(public)/campaigns/page.tsx` — stub

QA gate F:
- `pnpm lint && pnpm build` passes
- Each URL returns a page (no 404)
- `/pets`, `/campaigns`, `/workspaces/test-id` all render stub text
