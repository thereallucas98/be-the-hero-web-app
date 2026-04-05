# Research — F3: Guardian Portal

## Decision 1 — Layout: single vs nested route groups

**Options:**
- A) `(guardian)/layout.tsx` — auth guard + sidebar + main, wraps all 5 pages directly
- B) `(guardian)/(portal)/layout.tsx` — extra nesting for potential future unauthenticated guardian pages

**Decision: A — single layout.**

No unauthenticated guardian pages are planned. Single layout is simpler, easier to follow, consistent with `(workspace)/workspaces/[id]/layout.tsx` pattern.

---

## Decision 2 — Auth guard location: layout vs middleware

**Options:**
- A) Server component redirect in `(guardian)/layout.tsx`
- B) Next.js `middleware.ts` — intercepts requests before rendering, redirects unauthenticated/wrong-role users

**Decision: B — middleware.**

Guardian routes (`/guardian/*`) are globally private — middleware is the correct level for this. It intercepts at the edge before any layout/page renders, giving faster redirects and a single protection point. The `bth_access` cookie can be checked in middleware without full JWT verification (presence check + basic decode for role). `getServerPrincipal()` remains available in layouts/pages for reading the actual user data.

Middleware matcher: `'/guardian/:path*'`

---

## Decision 3 — F3.2 interests: React Query vs server component + Server Actions

**Options:**
- A) React Query `useQuery` + `useMutation` — client component, fetches from `/api/me/interests`
- B) Server component + Next.js Server Action for withdraw

**Decision: A — React Query.**

React Query is the established pattern in this codebase for client-side data with mutations. `useMutation` for withdraw gives optimistic UI or instant refetch. Server Actions are not used elsewhere in this project.

---

## Decision 4 — Interest withdraw: optimistic update + refetch

**Decision: Both — optimistic update AND invalidate on settle.**

Remove the item from the React Query cache immediately (optimistic) so the UI feels instant. On success, invalidate the query to sync the real server state (correct total count, pagination). On error, rollback the optimistic removal and show a toast. This gives the best UX without sacrificing correctness.

---

## Decision 5 — Private routes: React Query for all

**Rule: every private route uses React Query.**

All guardian portal pages (F3.2–F3.5) are client components with `useQuery` fetching from the REST API routes. This is the project-wide rule for private routes — consistent data fetching pattern, built-in caching, loading/error states, and easy mutation invalidation.

GraphQL is not yet set up in this project. When it is added (separate task), all private routes will migrate from `fetch('/api/...')` to GraphQL queries. For now: **React Query + REST**.

---

## Decision 6 — Follow-up status display

Follow-up timeline entry has `type`, `status`, `scheduledAt`, `currentSubmission`.

**Status badge colours:**
- `PENDING` → warning (yellow) — "Pendente"
- `SUBMITTED` → secondary (blue-ish) — "Enviado"  
- `APPROVED` → success (green) — "Aprovado"
- `REJECTED` → destructive (red) — "Rejeitado"

**Type labels:**
- `MONTHLY` → "Acompanhamento mensal"
- `QUARTERLY` → "Acompanhamento trimestral"
- `ANNUAL` → "Acompanhamento anual"

---

## Decision 7 — Sidebar: shared component vs copy

**Options:**
- A) New `GuardianSidebar` in `components/features/guardian/`
- B) Extend `WorkspaceSidebar` with generic nav items prop

**Decision: A — dedicated `GuardianSidebar`.**

`WorkspaceSidebar` is workspace-specific (takes `workspaceId`, builds workspace-scoped URLs). Guardian sidebar has fixed routes (`/guardian/*`), no dynamic segment. Extending would add complexity for the wrong abstraction. A new focused component is cleaner.

---

## Decision 8 — Mobile navigation

**Options:**
- A) Sidebar hidden on mobile, bottom navigation bar instead
- B) Sidebar always visible (scrolls off-screen on small devices)
- C) Same icon-only sidebar as desktop, stacked at top on mobile

**Decision: A — bottom nav bar on mobile (`lg:hidden`).**

Consistent with mobile UX best practices for portal apps. Desktop keeps the left sidebar (`hidden lg:flex`). Bottom bar shows the same 3 icons + back.

---

## Summary

| Aspect | Decision |
|---|---|
| Layout | Single `(guardian)/layout.tsx` — auth guard + sidebar |
| Auth guard | Server component redirect via `getServerPrincipal()` |
| Interests | React Query + invalidate on withdraw |
| Adoptions/Detail | Server components |
| Profile | Client component + React Hook Form |
| Mobile nav | Bottom bar on mobile, sidebar on desktop |
| Sidebar | Dedicated `GuardianSidebar` component |
