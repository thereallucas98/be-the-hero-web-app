# Exploration — F4.2: Workspace Metrics Dashboard

## API response shape

`GET /api/workspaces/:id/metrics` → `WorkspaceMetricsData`:
- `totalPets`, `petsByStatus` (Record), `totalViews`, `totalWhatsappClicks`, `totalInterests`, `totalAdoptions`, `totalDonationsRaised` (string/Decimal)

## Sidebar

Currently has: Pets, Interesses, Adoções, Campanhas, Configurações. Need to add "Métricas" as the first item (BarChart3 icon).

## Pattern

Same as admin dashboard — KPI cards + breakdown. React Query + REST.
