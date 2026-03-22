# Exploration — Public Discovery (Phase 7)

## 7.1 Enhanced pet listing

`GET /api/pets` already exists with these filters:
- `cityPlaceId` (UUID, workspace primary location)
- `species`, `sex`, `size`, `ageCategory` (enum filters)
- `page`, `perPage` (max 20)

Missing from roadmap:
- `workspaceId` — filter pets by specific workspace
- `hasRequirements=false` — pets with no requirements (lower adoption barrier)

`listPublicPets` in `pet.repository.ts` builds a Prisma where clause conditionally.
Adding `workspaceId` is a direct filter. `hasRequirements=false` maps to `requirements: { none: {} }`.

Schema: `ListPetsQuerySchema` in `pet.schema.ts` — add `workspaceId` (uuid, optional) and `hasRequirements` (boolean coerce, optional).

## 7.2 Public workspace profile

`GET /api/workspaces/:id` exists but is auth-gated (returns 401 for unauth users — but looking at the route code it calls `getPrincipal` optionally and the use case allows public access for members... actually the existing route does call `getWorkspaceById` which returns FORBIDDEN for non-members, 401 for unauthenticated).

Need a NEW `GET /api/workspaces/:id/public` endpoint that:
- Requires no auth
- Returns: name, type, description, city (primary location), approved pets (summary list, max 6), active campaigns (summary list, max 3)
- Only works if workspace is APPROVED and isActive=true

New repository method: `findByIdPublic(id)` on `WorkspaceRepository`.

## 7.3 Public campaign listing

`GET /api/campaigns` — does NOT exist yet. Current campaign routes are workspace-scoped or admin-scoped.

New endpoint, no auth required:
- Filters: `cityId` (via workspace locations), `workspaceId`, `petId`, `page`, `perPage`
- Only returns APPROVED campaigns from APPROVED/isActive workspaces

New repository method: `listPublic(input)` on `CampaignRepository`.
New schema: `ListPublicCampaignsQuerySchema`.
New use case: `listPublicCampaigns`.
New route: `GET /api/campaigns/route.ts`.
