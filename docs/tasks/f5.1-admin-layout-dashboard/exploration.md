# Exploration — F5.1: Admin Layout + Dashboard

## Current state

No `(admin)` route group or admin components exist. All admin APIs are implemented.

## Middleware

Currently only protects `/guardian/*` for GUARDIAN role. Needs to be extended for `/admin/*` with ADMIN/SUPER_ADMIN role check.

## API

`GET /api/admin/metrics` returns:
```ts
PlatformMetricsData {
  totalPets: number
  petsByStatus: Record<string, number>
  totalAdoptions: number
  totalCampaigns: number
  campaignsByStatus: Record<string, number>
  totalDonationsRaised: string  // Decimal as string
  totalActiveWorkspaces: number
}
```

## Sidebar nav items (8)

| Label | Icon | Route | Purpose |
|---|---|---|---|
| Métricas | BarChart3 | /admin/dashboard | Platform metrics |
| Pets | PawPrint | /admin/pets | Pet approval queue |
| Workspaces | Building2 | /admin/workspaces | Workspace verification |
| Campanhas | Megaphone | /admin/campaigns | Campaign review |
| Doações | HandCoins | /admin/donations | Donation approval |
| Follow-ups | ClipboardCheck | /admin/follow-ups | Follow-up submissions |
| Cobertura | MapPin | /admin/coverage | City coverage management |
| Logs | FileText | /admin/audit-logs | Audit log viewer |

## Patterns to follow

- `GuardianSidebar` — `hidden lg:flex` sidebar + mobile bottom nav
- `GuardianBottomNav` — `lg:hidden` fixed bottom bar
- Workspace layout — sidebar + main flex container

## Risks

- 8 nav items may be too many for mobile bottom nav — show top 4-5, rest in a "more" menu or scrollable
- `totalDonationsRaised` is a string (Prisma Decimal) — need `Number()` conversion
