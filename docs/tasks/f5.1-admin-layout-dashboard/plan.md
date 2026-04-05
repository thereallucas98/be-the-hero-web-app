# Plan — F5.1: Admin Layout + Dashboard

## Sub-steps

### Step 1 — Middleware: add admin route protection

Extend `middleware.ts` to handle both `/guardian/*` and `/admin/*` with their respective role checks.

**File modified:** `apps/web/src/middleware.ts`

### Step 2 — AdminSidebar + AdminBottomNav

Same pattern as guardian sidebar. 8 nav items with icons.

**Files created:**
- `components/features/admin/admin-sidebar.tsx`
- `components/features/admin/admin-bottom-nav.tsx`

### Step 3 — Admin layout

`app/(admin)/admin/layout.tsx` — sidebar + main + bottom nav.

**File created:** `app/(admin)/admin/layout.tsx`

### Step 4 — Dashboard page with KPI cards

Client component, React Query fetching from `/api/admin/metrics`. KPI cards grid.

**File created:** `app/(admin)/admin/dashboard/page.tsx`

### Step 5 — Lint + build + browser QA checklist

## Execution order

1 → 2 → 3 → 4 → 5
