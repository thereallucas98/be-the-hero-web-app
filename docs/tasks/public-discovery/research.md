# Research — Public Discovery (Phase 7)

## 7.1 Enhanced pet listing — changes needed

### Schema (`pet.schema.ts`)
Add to `ListPetsQuerySchema`:
- `workspaceId: z.uuid().optional()`
- `hasRequirements: z.coerce.boolean().optional()`

### Repository (`pet.repository.ts`) — `ListPublicPetsInput` + `listPublicPets`
Add to input interface:
- `workspaceId?: string`
- `hasRequirements?: boolean`

Add to where clause:
```typescript
if (input.workspaceId) where.workspaceId = input.workspaceId
if (input.hasRequirements === false) where.requirements = { none: {} }
```

### Route (`apps/web/src/app/api/pets/route.ts`)
Add to query parsing:
```typescript
workspaceId: searchParams.get('workspaceId') ?? undefined,
hasRequirements: searchParams.get('hasRequirements') ?? undefined,
```

No new use case needed — the existing `listPets` use case is a pass-through.

## 7.2 Public workspace profile — new endpoint

### Repository (`workspace.repository.ts`) — `findByIdPublic`
New method returning a public-safe shape:
- Only if `isActive=true AND verificationStatus='APPROVED'`
- Returns: id, name, type, description, phone, whatsapp, emailPublic, website, instagram, primaryLocation (city name, slug), approvedPets (max 6, status=APPROVED), activeCampaigns (max 3, status=APPROVED, within date range)

### Use case (`get-public-workspace.use-case.ts`)
No auth. Returns NOT_FOUND if workspace not found or not public.

### Route
`GET /api/workspaces/:id/public/route.ts` — separate from existing `[id]/route.ts`

## 7.3 Public campaign listing — new endpoint

### Schema (`campaign.schema.ts` or new `public.schema.ts`)
`ListPublicCampaignsQuerySchema`:
- `cityId: z.uuid().optional()`
- `workspaceId: z.uuid().optional()`
- `petId: z.uuid().optional()`
- `page: z.coerce.number().int().positive().optional().default(1)`
- `perPage: z.coerce.number().int().positive().max(20).optional().default(20)`

### Repository (`campaign.repository.ts`) — `listPublic`
- Filters by `status='APPROVED'`, workspace `isActive=true AND verificationStatus='APPROVED'`
- Optional: cityId (via workspace locations), workspaceId, petId
- Returns: id, title, description, goalAmount (string), currentAmount (string), currency, coverImageUrl, endsAt, workspace (id, name), pet (id, name, species)

### Use case (`list-public-campaigns.use-case.ts`)
No auth required — public.

### Route
`GET /api/campaigns/route.ts`

## Key decisions

1. `findByIdPublic` includes embedded pets and campaigns — avoids extra round trips for the most common UI use case (workspace profile page)
2. `GET /api/campaigns` is auth-free — matches public discovery intent
3. `hasRequirements=false` uses Prisma's `requirements: { none: {} }` relation filter — clean and DB-level
4. No new migrations needed
