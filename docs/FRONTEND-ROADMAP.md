# Frontend Roadmap — BeTheHero

> Status legend: ✅ Done · 🔲 To do · 🎨 Needs Figma fetch first

**API status: 100% complete (Phases 0–7)**
**Design system: ✅ Complete** (Nunito, Figma tokens, Button, Input, Label, Badge, Card, Avatar, Select, Dialog, Logo)

---

## Architecture

```
app/
  (public)/                  → Landing, pet listing, pet detail, workspace public, campaigns
  (auth)/                    → Login, register, verify, forgot-password, reset-password
  (guardian)/                → Guardian portal (my interests, adoptions, profile)
  (workspace)/               → Partner portal (pets, campaigns, members, metrics)
  (admin)/                   → Admin panel (queues, coverage, metrics, audit)
```

---

## Sprint F0 — Design System & Core Components ✅

- ✅ `globals.css` — Figma tokens (colors, Nunito, radius, type scale)
- ✅ `layout.tsx` — Nunito font loaded
- ✅ `button.tsx` — `tv()` + Radix Slot, variants: default/secondary/ghost/destructive/outline/link
- ✅ `input.tsx` — `twMerge`, `forwardRef`
- ✅ `label.tsx` — Radix Label, `twMerge`
- ✅ `badge.tsx` — `tv()`, variants: default/secondary/warning/destructive/outline/success
- ✅ `card.tsx` — compound: Card/Header/Title/Description/Content/Footer
- ✅ `avatar.tsx` — Radix Avatar, size+ring variants
- ✅ `select.tsx` — Radix Select, `twMerge`, Tailwind v4 canonical
- ✅ `dialog.tsx` — Radix Dialog, bottom-sheet on mobile preserved
- ✅ `logo.tsx` — `Logo`, `LogoIcon`, `LogoWordmark` (SVG from Figma)

**Figma screens still to fetch:**
- 🎨 Location picker (`308:3`)
- 🎨 Pet profile (`1:834`)
- 🎨 Login (`1213:199`)
- 🎨 Register (`1213:4`)
- 🎨 Add Pet (`1256:5`)
- ✅ Sections (`26:3`, `26:29`, `57:3`, `57:321`) — built in landing page

---

## Sprint F1 — Public Marketing Pages ⬛ (in progress)

> Figma: Home, LP, Mobile, Sections, About screens
> API used: `GET /api/pets`, `GET /api/campaigns`, `GET /api/workspaces/:id/public`

### F1.1 — Navigation (desktop + mobile)
- ✅ `components/features/nav/site-header.tsx` — logo, links, CTA button, mobile hamburger
- ✅ `components/features/nav/mobile-menu.tsx` — full-screen mobile nav

### F1.2 — Landing page (`app/(public)/page.tsx`) ✅
- ✅ Hero section — heading, subtext, CTA "Acesse agora", social-proof avatars
- ✅ Features section — 3 feature cards + app mockup
- ✅ CTA section
- ✅ About section — `components/features/landing/about-section.tsx`
- ✅ Contact section — `components/features/landing/contact-section.tsx` (isometric phone card)
- ✅ Footer — `components/features/landing/site-footer.tsx`

### F1.3 — Public pet listing (`app/(public)/pets/page.tsx`)
- Filter sidebar — Idade, Tipo, Nível de Energia, Porte, Nível de Independência
- Location picker — state → city flow
- Pet card grid
- "Encontre X amigos na sua cidade" heading
- Pagination / infinite scroll

### F1.4 — Pet detail (`app/(public)/pets/[id]/page.tsx`)
- Pet photos carousel
- Pet info — name, age, size, energy, independence, sociability, gender
- Requirements list
- Workspace card (contact/WhatsApp CTA)
- "Register interest" button (requires auth)
- Track VIEW_PET + CLICK_WHATSAPP events

### F1.5 — Public workspace profile (`app/(public)/workspaces/[id]/page.tsx`)
- Header (name, verified badge, location, description)
- Pets preview (up to 6)
- Active campaigns preview (up to 3)
- Contact info

### F1.6 — Public campaigns (`app/(public)/campaigns/page.tsx`)
- Campaign cards — title, goal, progress bar, deadline
- Filters (city, workspace)

---

## Sprint F2 — Auth Flow

> Figma: Login (`1213:199`), Register (`1213:4`) — fetch when rate limit clears
> API used: `POST /api/auth/*`

### F2.1 — Login (`app/(auth)/login/page.tsx`)
- Email + password form
- "Forgot password?" link
- Error handling (invalid credentials)
- Redirect to portal after login

### F2.2 — Register guardian (`app/(auth)/register/page.tsx`)
- Name, email, password, phone
- Role selection: Guardian vs Partner (workspace)
- On success → verify email prompt

### F2.3 — Register workspace (`app/(auth)/register/workspace/page.tsx`)
- Org name, CNPJ, type (ONG/Clinic/Petshop), description
- Address (state → city)
- On success → pending verification state

### F2.4 — Email verification (`app/(auth)/verify/page.tsx`)
- Token from query param → auto-verify on load
- Resend link if token expired

### F2.5 — Password reset
- `app/(auth)/forgot-password/page.tsx` — email form
- `app/(auth)/reset-password/page.tsx` — new password + token

---

## Sprint F3 — Guardian Portal

> API used: `GET /api/me`, `GET /api/me/interests`, `GET /api/me/adoptions`, follow-ups

### F3.1 — Guardian layout + dashboard (`app/(guardian)/layout.tsx`)
- Sidebar/nav: Meus Interesses, Minhas Adoções, Perfil
- Auth guard (redirect to login if not authenticated)

### F3.2 — My interests (`app/(guardian)/interests/page.tsx`)
- List of adoption interests with pet thumbnail + status badge
- Withdraw interest action

### F3.3 — My adoptions (`app/(guardian)/adoptions/page.tsx`)
- List adoptions with follow-up progress indicator

### F3.4 — Adoption detail + follow-up (`app/(guardian)/adoptions/[id]/page.tsx`)
- Adoption summary
- Follow-up timeline (scheduled → submitted → approved/rejected)
- Submit follow-up form (text + optional images)

### F3.5 — Profile settings (`app/(guardian)/profile/page.tsx`)
- Edit name, phone
- Change password
- `PATCH /api/me`, `PATCH /api/me/password`

---

## Sprint F4 — Workspace Portal (Partner)

> Figma: Add Pet (`1256:5`) — fetch when rate limit clears
> API used: workspace, pets, campaigns, interests, adoptions endpoints

### F4.1 — Workspace layout + dashboard (`app/(workspace)/layout.tsx`)
- Sidebar: Pets, Interesses, Adoções, Campanhas, Métricas, Configurações
- Auth guard (workspace role required)

### F4.2 — Workspace metrics (`app/(workspace)/dashboard/page.tsx`)
- `GET /api/workspaces/:id/metrics`
- KPI cards: total pets, interests, adoptions, campaigns
- Pet funnel chart

### F4.3 — Pet management (`app/(workspace)/pets/page.tsx`)
- List with status badges (DRAFT/PENDING/APPROVED/REJECTED)
- Create pet modal/page
- Edit pet modal
- Submit for review
- `GET/POST/PATCH /api/workspaces/:id/pets`

### F4.4 — Pet detail (workspace) (`app/(workspace)/pets/[id]/page.tsx`)
- Images management (upload, reorder, set cover)
- Requirements management (add/edit/delete)
- Submit for review button
- `POST/PATCH/DELETE /api/pets/:id/images`, `/requirements`

### F4.5 — Adoption interests incoming (`app/(workspace)/interests/page.tsx`)
- List interests by workspace
- Dismiss or convert to adoption
- `GET /api/workspaces/:id/interests`, convert endpoint

### F4.6 — Campaign management (`app/(workspace)/campaigns/page.tsx`)
- List campaigns (DRAFT/PENDING/APPROVED)
- Create/edit campaign form
- Attach documents
- Submit for review
- View donations list

### F4.7 — Workspace settings (`app/(workspace)/settings/page.tsx`)
- Profile: name, description, type, contact, socials
- Location: state → city picker
- Members: invite, role change, remove
- City coverage: add/remove cities

---

## Sprint F5 — Admin Panel

> API used: all `/api/admin/*` endpoints, `/api/admin/metrics`

### F5.1 — Admin layout + dashboard (`app/(admin)/layout.tsx` + `dashboard/page.tsx`)
- Sidebar: Métricas, Pets, Workspaces, Campanhas, Doações, Follow-ups, Cobertura, Logs
- Platform metrics overview
- `GET /api/admin/metrics`

### F5.2 — Pet approval queue (`app/(admin)/pets/page.tsx`)
- List PENDING pets with filters
- Approve / reject with reviewNote
- `GET /api/pets` (status=PENDING), `POST /api/admin/pets/:id/approve|reject`

### F5.3 — Workspace verification queue (`app/(admin)/workspaces/page.tsx`)
- List PENDING workspaces
- Approve / reject
- `GET /api/admin/workspaces`, approve/reject endpoints

### F5.4 — Campaign review queue (`app/(admin)/campaigns/page.tsx`)
- List PENDING_REVIEW campaigns
- Approve / reject with note
- `GET /api/admin/campaigns`, approve/reject endpoints

### F5.5 — Donation approval queue (`app/(admin)/donations/page.tsx`)
- List PENDING donations
- Approve (triggers currentAmount increment) / reject
- `GET /api/admin/donations`, approve/reject endpoints

### F5.6 — Follow-up submissions (`app/(admin)/follow-ups/page.tsx`)
- List pending submissions
- Approve / reject
- `GET /api/admin/follow-up-submissions`, approve/reject endpoints

### F5.7 — Admin coverage management (`app/(admin)/coverage/page.tsx`)
- View admin's covered cities
- Add / remove city coverage
- `GET/POST/DELETE /api/admin/coverage`

### F5.8 — Audit log viewer (`app/(admin)/audit-logs/page.tsx`)
- Filterable log table (by actor, action, entity, date range)
- `GET /api/admin/audit-logs`

---

## Dependencies

```
F0 (Design System)     ← ✅ DONE
F1 (Public pages)      ← depends on F0 ✅
F2 (Auth flow)         ← depends on F0 ✅
F3 (Guardian portal)   ← depends on F2
F4 (Workspace portal)  ← depends on F2
F5 (Admin panel)       ← depends on F2
```

---

## Summary

| Sprint | Scope | Pages/Components |
|---|---|---|
| F0 | Design system | ✅ 11 components done |
| F1 | Public marketing | ⬛ LP done; pet listing/detail/campaigns pending |
| F2 | Auth | 5 pages |
| F3 | Guardian portal | 5 pages |
| F4 | Workspace portal | 7 pages |
| F5 | Admin panel | 8 pages |
| **Total** | | **~32 pages** |
