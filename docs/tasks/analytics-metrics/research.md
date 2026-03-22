# Research — Analytics & Metrics (Phase 6)

## Queries required per endpoint

### GET /api/workspaces/:id/metrics

All queries scoped by `workspaceId`:

| Metric | Prisma query |
|---|---|
| totalPets | `pet.count({ where: { workspaceId } })` |
| petsByStatus | `pet.groupBy({ by: ['status'], where: { workspaceId }, _count: true })` |
| totalViews | `petMetricEvent.count({ where: { workspaceId, type: 'VIEW_PET' } })` |
| totalWhatsappClicks | `petMetricEvent.count({ where: { workspaceId, type: 'CLICK_WHATSAPP' } })` |
| totalInterests | `adoptionInterest.count({ where: { workspaceId } })` |
| totalAdoptions | `adoption.count({ where: { workspaceId } })` |
| totalDonationsRaised | `donation.aggregate({ where: { workspaceId, status: 'APPROVED' }, _sum: { amount: true } })` |

All 7 run in a single `prisma.$transaction([...])` for consistency.

`totalDonationsRaised` is a `Decimal` — serialize to string.

### GET /api/pets/:id/metrics

All queries scoped by `petId`:

| Metric | Prisma query |
|---|---|
| views | `petMetricEvent.count({ where: { petId, type: 'VIEW_PET' } })` |
| whatsappClicks | `petMetricEvent.count({ where: { petId, type: 'CLICK_WHATSAPP' } })` |
| interestCount | `adoptionInterest.count({ where: { petId } })` |
| adoptionStatus | from `pet.findUnique({ where: { id: petId }, select: { status, adoption: { select: { id, adoptedAt, status } } } })` |

All queries in one `$transaction`.

### GET /api/admin/metrics

Optional filters: `cityId` (scope to workspaces in that city), `dateFrom`, `dateTo` (scope createdAt).

| Metric | Notes |
|---|---|
| totalPets | count, optionally scoped by workspace cityId |
| petsByStatus | groupBy status |
| totalAdoptions | count |
| totalCampaigns | count |
| campaignsByStatus | groupBy status |
| totalDonationsRaised | sum(amount) where status=APPROVED |
| totalActiveWorkspaces | count where isActive=true AND verificationStatus=APPROVED |

`cityId` scoping: filter through `workspace.locations` (PartnerWorkspaceLocation has cityPlaceId). Collect workspaceIds for that city, then scope all counts.

`dateFrom`/`dateTo` applied to `createdAt` of each entity.

## RBAC design

### Workspace metrics (6.1)
- Check user is workspace member with role OWNER, EDITOR, or FINANCIAL → or is ADMIN/SUPER_ADMIN
- Use workspace.repository `findByIdSimple` to check exists, then check membership via principal.memberships

### Per-pet metrics (6.1)
- Same RBAC as workspace metrics: check pet.workspaceId membership
- Need `pet.findByIdWithWorkspace` (already exists) to get workspaceId

### Platform metrics (6.2)
- ADMIN or SUPER_ADMIN

## Implementation approach

### New: MetricsRepository
Single repository encapsulating all aggregation queries. Keeps business logic in use cases, raw queries in repo.

```typescript
interface MetricsRepository {
  getWorkspaceMetrics(workspaceId: string): Promise<WorkspaceMetricsData>
  getPetMetrics(petId: string): Promise<PetMetricsData>
  getPlatformMetrics(input: PlatformMetricsInput): Promise<PlatformMetricsData>
}
```

### No new migrations needed
All data already exists in the schema.

### Decimal serialization
`totalDonationsRaised` from aggregate — serialize via `String(result._sum.amount ?? 0)`.

## Endpoint summary

| Route | Auth | Handler |
|---|---|---|
| `GET /api/workspaces/:id/metrics` | workspace member (OWNER/EDITOR/FINANCIAL) or ADMIN/SUPER_ADMIN | getWorkspaceMetrics |
| `GET /api/pets/:id/metrics` | same as above (via pet's workspaceId) | getPetMetrics |
| `GET /api/admin/metrics` | ADMIN or SUPER_ADMIN | getPlatformMetrics |
