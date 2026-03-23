# Brief — Sprint F1: Public Marketing Pages

## Context

BeTheHero frontend is a blank slate. API is 100% complete (Phases 0–7). Design system is done (Sprint F0). Sprint F1 builds the public-facing marketing pages — visible to all visitors before authentication.

## Goal

Implement the public marketing experience based on Figma designs. No auth required. SEO-friendly server components where possible.

## Scope (this sprint)

### In scope — full Figma data available
- **F1.1** Route group `(public)` + layout
- **F1.2** `SiteHeader` component (desktop nav + logo)
- **F1.3** `MobileMenu` component (hamburger dropdown)
- **F1.4** Landing page (`/`) — Hero section + Features/About section

### In scope — stub only (Figma pending rate-limit)
- **F1.5** `/pets` — stub placeholder
- **F1.6** `/pets/[id]` — stub placeholder
- **F1.7** `/workspaces/[id]` — stub placeholder
- **F1.8** `/campaigns` — stub placeholder

### Out of scope
- Auth-gated interactions (register interest, donate)
- Actual pet/campaign data fetching (sprint F1 is layout only)
- F2–F5 portals

## Users
- Anonymous visitor — lands on homepage, sees brand, navigates to pets/campaigns
- Returning user — same experience pre-login

## Success criteria
- Landing page matches Figma design (colors, typography, layout)
- Responsive: 360px / 768px / 1440px
- `pnpm lint` passes (0 warnings)
- `pnpm build` succeeds
- Browser checklist passes (manual QA gate)
