# Validation — F4.2: Workspace Metrics Dashboard

## Build validation

| Check | Status |
|---|---|
| `pnpm lint` passes | ✅ |

## Browser QA Checklist

**Login:** `partner_test@example.com` / `Pass1234!`
**URL:** `/workspaces/6ca9ce13-c66e-4689-b9b9-35a0abd83bf1/dashboard`

### Dashboard
- [ ] KPI cards: Total de pets, Visualizações, Cliques no WhatsApp, Interesses, Adoções, Doações arrecadadas (R$)
- [ ] Pets by status breakdown card
- [ ] Loading skeleton while fetching

### Sidebar
- [ ] "Métricas" (BarChart3 icon) as first nav item
- [ ] Highlighted when on dashboard page
