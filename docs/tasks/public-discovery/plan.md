# Plan — Public Discovery (Phase 7)

## Step 1 — Enhanced pet listing → QA gate A

- `apps/web/src/server/schemas/pet.schema.ts` (MODIFY)
  - Add `workspaceId: z.uuid().optional()` and `hasRequirements: z.coerce.boolean().optional()` to `ListPetsQuerySchema`
- `apps/web/src/server/repositories/pet.repository.ts` (MODIFY)
  - Add `workspaceId?: string` and `hasRequirements?: boolean` to `ListPublicPetsInput`
  - Add filters in `listPublicPets`: `workspaceId` direct filter, `hasRequirements === false → requirements: { none: {} }`
- `apps/web/src/app/api/pets/route.ts` (MODIFY)
  - Pass `workspaceId` and `hasRequirements` from searchParams to schema
- QA gate A: filter by workspaceId, hasRequirements=false, combined filters, existing filters still work

## Step 2 — Public workspace profile → QA gate B

- `apps/web/src/server/repositories/workspace.repository.ts` (MODIFY)
  - Add `findByIdPublic(id)` → returns public workspace shape with embedded approved pets (max 6) and active campaigns (max 3); returns null if not found/not public
- `apps/web/src/server/use-cases/workspaces/get-public-workspace.use-case.ts` (NEW)
  - No auth; returns NOT_FOUND if workspace null
- `apps/web/src/server/use-cases/index.ts` (MODIFY) — export getPublicWorkspace
- `apps/web/src/app/api/workspaces/[id]/public/route.ts` (NEW) — GET, no auth
- QA gate B: happy path, workspace not found, workspace not approved/inactive

## Step 3 — Public campaign listing → QA gate C

- `apps/web/src/server/schemas/campaign.schema.ts` (MODIFY) — add `ListPublicCampaignsQuerySchema`
- `apps/web/src/server/repositories/campaign.repository.ts` (MODIFY)
  - Add `listPublic(input)` — filters: status=APPROVED, workspace APPROVED+active, optional cityId/workspaceId/petId
- `apps/web/src/server/use-cases/campaigns/list-public-campaigns.use-case.ts` (NEW)
  - No auth; thin wrapper over repo
- `apps/web/src/server/use-cases/index.ts` (MODIFY) — export listPublicCampaigns
- `apps/web/src/app/api/campaigns/route.ts` (NEW) — GET, no auth
- QA gate C: happy path, cityId/workspaceId/petId filters, pagination, only APPROVED campaigns returned

## Step 4 — Swagger docs + lint + build + roadmap → Final gate

- `apps/web/src/lib/swagger/definitions/pets.ts` (MODIFY) — document new query params
- `apps/web/src/lib/swagger/definitions/workspaces.ts` (MODIFY) — add public workspace endpoint
- `apps/web/src/lib/swagger/definitions/campaigns.ts` (MODIFY) — add public campaigns listing
- `pnpm lint && pnpm build` must pass
- `docs/API-ROADMAP.md` — mark Phase 7 ✅
