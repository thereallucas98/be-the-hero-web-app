# Validation — F1.6: Public Campaigns Page

## Build & Lint

| Check | Result |
|---|---|
| `pnpm lint` | ✅ 0 warnings |
| `pnpm build` | ✅ `/campaigns` present as `ƒ` (dynamic SSR) |

## API QA

| # | Test | Expected | Result |
|---|---|---|---|
| 1 | `GET /api/campaigns` | 200 | ✅ |
| 2 | `GET /api/campaigns?cityId=...` | 200 + filtered results | ✅ |
| 3 | `GET /api/campaigns?workspaceId=...` | 200 + filtered results | ✅ |
| 4 | `GET /api/campaigns?cityId=not-a-uuid` | 400 | ✅ |
| 5 | Page renders `/campaigns` | 200 | ✅ |
| 6 | Page content — heading, counter, filter bar | All present | ✅ |
| 7 | Page with `?workspaceId=` — workspace chip | Chip name shown | ✅ |
| 8 | Page with unknown workspaceId — no crash | 200, chip absent | ✅ |

## Acceptance Criteria

| Criterion | Status |
|---|---|
| Campaign cards: cover, title, workspace link, Progress, amounts, deadline | ✅ |
| City filter bar (state → city cascade, isDirty, Buscar) | ✅ |
| Workspace chip (dismissible, shown from URL param) | ✅ |
| Empty state when no results | ✅ |
| Pagination preserving filters | ✅ |
| Server-rendered (searchParams) | ✅ |
| SiteHeader + SiteFooter (marketing layout) | ✅ |
| `CampaignCard` extracted — `WorkspaceCampaignsPreview` refactored | ✅ |

## New files

- `components/features/campaigns/campaign-card.tsx`
- `components/features/campaigns/campaign-filter-bar.tsx`
- `app/(public)/(marketing)/campaigns/page.tsx` (replaced stub)

## Updated files

- `components/features/workspaces/workspace-campaigns-preview.tsx` (uses CampaignCard)
- `app/(public)/(detail)/workspaces/[id]/page.tsx` (passes workspaceId + workspaceName)
