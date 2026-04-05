# Validation — F5.1: Admin Layout + Dashboard

## Build validation

| Check | Status |
|---|---|
| `pnpm lint` passes (0 warnings) | ✅ |
| `pnpm build` succeeds | ✅ |
| Admin routes in build output | ✅ `/admin/dashboard` |
| Middleware protects `/admin/*` | ✅ |

## Browser QA Checklist

### Auth guard (middleware)
- [ ] Visit `/admin/dashboard` without logging in → redirect to `/login?redirectTo=/admin/dashboard`
- [ ] Login as guardian → visit `/admin/dashboard` → redirect to `/`
- [ ] Login as admin → page loads normally

### Layout & navigation
- [ ] **Desktop:** Left sidebar with 8 nav icons (Métricas, Pets, Workspaces, Campanhas, Doações, Follow-ups, Cobertura, Logs)
- [ ] **Desktop:** Active nav item highlighted
- [ ] **Desktop:** Back button → `/`
- [ ] **Mobile:** Sidebar hidden, bottom nav visible with all 8 items (scrollable)
- [ ] **Mobile:** Main content has bottom padding

### Dashboard (`/admin/dashboard`)
- [ ] KPI cards load: Total de pets, Adoções, Workspaces ativos, Campanhas, Doações arrecadadas
- [ ] Donations amount formatted as BRL (R$ X.XXX,XX)
- [ ] Pets by status breakdown card shows status labels in PT-BR
- [ ] Campaigns by status breakdown card shows status labels in PT-BR
- [ ] Loading skeleton appears while data loads
