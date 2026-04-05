# Research — F5.1: Admin Layout + Dashboard

## Decision 1 — Mobile nav: scrollable bottom bar

8 items don't fit in a mobile bottom bar. Use a horizontally scrollable bottom bar showing all items. Simpler than a "more" menu and keeps everything accessible.

## Decision 2 — Middleware: extend for admin routes

Add `/admin/:path*` to the middleware matcher. Check for ADMIN or SUPER_ADMIN role. Same JWT decode pattern as guardian.

## Decision 3 — Dashboard: KPI cards grid

Simple card grid with key numbers. No charts for now — just formatted numbers and labels. Can be enhanced later.

## Decision 4 — Metrics data fetching: React Query + REST

Same pattern as all other private routes.

## Summary

| Aspect | Decision |
|---|---|
| Mobile nav | Scrollable bottom bar |
| Middleware | Extend matcher for `/admin/*`, check ADMIN/SUPER_ADMIN |
| Dashboard | KPI cards grid |
| Data fetching | React Query + REST |
