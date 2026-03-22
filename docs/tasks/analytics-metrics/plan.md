# Plan — Analytics & Metrics (Phase 6)

## Step 1 — MetricsRepository + workspace & pet metrics → QA gate A

- `apps/web/src/server/repositories/metrics.repository.ts` (NEW)
  - `getWorkspaceMetrics(workspaceId)` → 7 counts/aggregates in $transaction
  - `getPetMetrics(petId)` → 4 queries in $transaction
- `apps/web/src/server/use-cases/metrics/get-workspace-metrics.use-case.ts` (NEW)
  - RBAC: workspace member (OWNER/EDITOR/FINANCIAL) or ADMIN/SUPER_ADMIN
  - Checks workspace exists (findByIdSimple) then checks membership via principal
- `apps/web/src/server/use-cases/metrics/get-pet-metrics.use-case.ts` (NEW)
  - Fetches pet to get workspaceId, then applies same RBAC as workspace
- `apps/web/src/server/repositories/index.ts` (MODIFY) — export metricsRepository
- `apps/web/src/server/use-cases/index.ts` (MODIFY) — export new use cases
- `apps/web/src/app/api/workspaces/[id]/metrics/route.ts` (NEW) — GET
- `apps/web/src/app/api/pets/[id]/metrics/route.ts` (NEW) — GET
- QA gate A: happy path, 401, 403, 404 for both endpoints

## Step 2 — Platform metrics (admin) → QA gate B

- `metrics.repository.ts` (MODIFY) — add `getPlatformMetrics(input)`
  - Filters: optional cityId, dateFrom, dateTo
  - Returns: totalPets, petsByStatus, totalAdoptions, totalCampaigns, campaignsByStatus, totalDonationsRaised, totalActiveWorkspaces
- `apps/web/src/server/use-cases/metrics/get-platform-metrics.use-case.ts` (NEW)
  - RBAC: ADMIN or SUPER_ADMIN
- `apps/web/src/server/schemas/metrics.schema.ts` (NEW)
  - `PlatformMetricsQuerySchema` — cityId (uuid, optional), dateFrom (datetime, optional), dateTo (datetime, optional)
- `apps/web/src/server/use-cases/index.ts` (MODIFY) — export getPlatformMetrics
- `apps/web/src/app/api/admin/metrics/route.ts` (NEW) — GET
- QA gate B: happy path, filters, 401, 403

## Step 3 — Swagger docs + lint + build + roadmap → Final gate

- `apps/web/src/lib/swagger/definitions/metrics.ts` (NEW) — all 3 endpoints
- `apps/web/src/lib/swagger.ts` (MODIFY) — add `Metrics` tag
- `pnpm lint && pnpm build` must pass
- `docs/API-ROADMAP.md` — mark Phase 6 ✅
