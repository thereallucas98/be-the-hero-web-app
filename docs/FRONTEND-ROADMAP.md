# Frontend Roadmap — BeTheHero

> Status legend: ✅ Done · 🔲 To do

**API status: 100% complete (Phases 0–7)**
**Frontend status: ✅ All sprints complete (F0–F5)**
**GraphQL: ✅ Infrastructure + guardian scope (Yoga, Pothos, codegen)**

---

## Architecture

```
app/
  (public)/                  → Landing, pet listing, pet detail, workspace public, campaigns
  (auth)/                    → Login, register, verify, forgot-password, reset-password
  (guardian)/                → Guardian portal (my interests, adoptions, profile)
  (workspace)/               → Partner portal (dashboard, pets, interests, campaigns, settings)
  (admin)/                   → Admin panel (dashboard, queues, coverage, audit logs)
```

---

## Sprint F0 — Design System & Core Components ✅

- ✅ `globals.css` — Figma tokens (colors, Nunito, radius, type scale)
- ✅ `button.tsx` — `cva()` + Radix Slot, 6 variants
- ✅ `input.tsx`, `label.tsx`, `textarea.tsx`
- ✅ `badge.tsx` — 6 variants
- ✅ `card.tsx` — compound component
- ✅ `avatar.tsx`, `select.tsx`, `dialog.tsx`, `alert-dialog.tsx`
- ✅ `logo.tsx` — Logo, LogoIcon, LogoWordmark
- ✅ `money-input.tsx` — BRL auto-format, numeric keyboard on mobile
- ✅ `empty-state.tsx` — configurable illustrations (pet, cat-lonely, dog-lonely)

---

## Sprint F1 — Public Marketing Pages ✅

- ✅ F1.1 Navigation (desktop + mobile)
- ✅ F1.2 Landing page (hero, features, CTA, about, contact, footer)
- ✅ F1.3 Public pet listing (filters, location picker, pagination)
- ✅ F1.4 Pet detail (photos, info, requirements, interest button, event tracking)
- ✅ F1.5 Public workspace profile (header, pets preview, campaigns preview, contact)
- ✅ F1.6 Public campaigns (cards, city filter, workspace chip, pagination)

---

## Sprint F2 — Auth Flow ✅

- ✅ F2.1 Login — role-based redirect (guardian→portal, partner→dashboard, admin→panel)
- ✅ F2.2 Register guardian
- ✅ F2.3 Register workspace (2-step)
- ✅ F2.4 Email verification
- ✅ F2.5 Forgot/reset password
- ✅ Logout button on all portal sidebars
- ✅ Login page redirects logged-in users to their portal

---

## Sprint F3 — Guardian Portal ✅

> GraphQL-powered via React Query + graphql-request

- ✅ F3.1 Layout + GuardianSidebar + mobile bottom nav
- ✅ F3.2 My interests — withdraw with optimistic update
- ✅ F3.3 My adoptions — follow-up progress indicator
- ✅ F3.4 Adoption detail + follow-up timeline
- ✅ F3.5 Profile settings — edit name/phone, change password
- ✅ Middleware route protection (`/guardian/*` → GUARDIAN role)

---

## Sprint F4 — Workspace Portal ✅

- ✅ F4.1 Layout + WorkspaceSidebar (6 nav items)
- ✅ F4.2 Metrics dashboard — KPI cards + quick action buttons (Novo pet, Interesses, Campanhas)
- ✅ F4.3 Pet management — list, create, edit, submit for review
- ✅ F4.4 Pet detail — images, requirements, submit for review
- ✅ F4.5 Adoption interests — list, dismiss, convert to adoption with dialog
- ✅ F4.6 Campaign management — list, create/edit (MoneyInput), submit, donations
- ✅ F4.7 Workspace settings — profile, location, members, coverage

---

## Sprint F5 — Admin Panel ✅

- ✅ F5.1 Admin layout + dashboard — KPI cards, role-based sidebar
- ✅ F5.2 Pet approval queue — list + detail page + approve/reject
- ✅ F5.3 Workspace verification — list + detail page + approve/reject
- ✅ F5.4 Campaign review — list + detail page + approve/reject
- ✅ F5.5 Donation approval — expandable rows + approve/reject
- ✅ F5.6 Follow-up submissions — expandable rows + approve/reject
- ✅ F5.7 Coverage management — state→city CRUD
- ✅ F5.8 Audit log viewer — filterable table + mobile cards
- ✅ Middleware route protection (`/admin/*` → ADMIN/SUPER_ADMIN)

---

## Infrastructure ✅

- ✅ GraphQL — Yoga + Pothos + graphql-request + codegen
- ✅ Middleware — Edge-compatible JWT decode, role-based route protection
- ✅ React Query — global provider, toast on error/success, optimistic updates

---

## Summary

| Sprint | Scope | Status |
|---|---|---|
| F0 | Design system | ✅ |
| F1 | Public pages (6) | ✅ |
| F2 | Auth (5 pages + logout) | ✅ |
| F3 | Guardian portal (5 pages) | ✅ |
| F4 | Workspace portal (7 pages) | ✅ |
| F5 | Admin panel (8 pages + 3 detail views) | ✅ |
| **Total** | **~35+ pages** | **✅ Complete** |
