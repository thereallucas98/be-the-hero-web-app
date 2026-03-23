# Todo — Sprint F1: Public Marketing Pages

## Sub-step 1 — Route group + layout + delete old page.tsx
- [x] Delete `app/page.tsx` (stale placeholder with broken tokens)
- [x] Create `app/(public)/layout.tsx` — SiteHeader + children
- [x] Create `app/(public)/page.tsx` — composes HeroSection + FeaturesSection
- [x] QA gate A: `pnpm lint && pnpm build` passes ✅

## Sub-step 2 — `MobileMenu` component
- [x] Create `components/features/nav/mobile-menu.tsx` ('use client')
- [x] QA gate B: lint passes ✅

## Sub-step 3 — `SiteHeader` component
- [x] Create `components/features/nav/mobile-menu-trigger.tsx` ('use client')
- [x] Create `components/features/nav/site-header.tsx` (server)
- [x] QA gate C: lint passes ✅

## Sub-step 4 — Hero illustration + `HeroSection`
- [x] Download `public/images/hero-pets.png` from Figma node 201:31 (1184×610px @2x)
- [x] Create `components/features/landing/hero-section.tsx` (server)
- [x] QA gate D: lint passes ✅

## Sub-step 5 — `FeaturesSection`
- [x] Create `components/features/landing/features-section.tsx` (server)
- [x] QA gate E: lint passes ✅

## Sub-step 6 — Stub pages
- [x] Create `app/(public)/pets/page.tsx`
- [x] Create `app/(public)/pets/[id]/page.tsx`
- [x] Create `app/(public)/workspaces/[id]/page.tsx`
- [x] Create `app/(public)/campaigns/page.tsx`
- [x] QA gate F: `pnpm lint && pnpm build` passes ✅ — all 4 routes in build output

## Sprint F1 — COMPLETE ✅
