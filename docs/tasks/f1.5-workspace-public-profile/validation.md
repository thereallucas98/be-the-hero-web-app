# Validation — F1.5: Public Workspace Profile

## Build & Lint

| Check | Result |
|---|---|
| `pnpm lint` | ✅ 0 warnings |
| `pnpm build` | ✅ Successful — `/workspaces/[id]` shows as `ƒ` (dynamic SSR) |

## Acceptance Criteria

| Criterion | Status |
|---|---|
| Header: name, type badge (PT-BR), city, description | ✅ |
| Pets preview grid (≤6) with "Ver todos" link | ✅ |
| Campaigns preview with Radix Progress bar + amounts + deadline | ✅ |
| Contact section: WhatsApp, phone, email, website, Instagram (conditional) | ✅ |
| `notFound()` on unknown/inactive/unverified workspace | ✅ |
| Pets section hidden when 0 approved pets | ✅ (returns null) |
| Campaigns section hidden when 0 active campaigns | ✅ (returns null) |
| Page fully server-rendered | ✅ (no `'use client'` in page) |
| Same sidebar + back-button layout as `pets/[id]/page.tsx` | ✅ |
| All sections extracted to `components/features/workspaces/` | ✅ |
| Radix `Progress` used (not raw div) | ✅ |

## New files

- `components/features/workspaces/workspace-profile-header.tsx`
- `components/features/workspaces/workspace-profile-contact.tsx`
- `components/features/workspaces/workspace-pets-preview.tsx`
- `components/features/workspaces/workspace-campaigns-preview.tsx`
- `app/(public)/workspaces/[id]/page.tsx` (replaced stub)
