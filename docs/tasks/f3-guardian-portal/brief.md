# Task Brief — F3: Guardian Portal

## User Story

> As a guardian, I want a personal portal where I can track my adoption interests,
> follow active adoptions, submit follow-up reports, and manage my profile.

## Scope

Build the complete `app/(guardian)/` route group from scratch. No files exist yet.

## Pages (5)

### F3.1 — Layout + auth guard
`app/(guardian)/layout.tsx`
- Sidebar navigation: Meus Interesses, Minhas Adoções, Perfil
- Auth guard: redirect to `/login?redirectTo=...` if unauthenticated or role ≠ GUARDIAN
- Mobile: bottom nav bar or hamburger

### F3.2 — My interests
`app/(guardian)/interests/page.tsx`
- List adoption interests with pet thumbnail, pet name, species, status badge
- Withdraw interest action (DELETE)
- API: `GET /api/me/interests`, `DELETE /api/pets/:petId/interests/:interestId`

### F3.3 — My adoptions
`app/(guardian)/adoptions/page.tsx`
- List adoptions with pet thumbnail, adoption date, status badge
- Follow-up progress indicator (scheduled/submitted/approved)
- API: `GET /api/me/adoptions`

### F3.4 — Adoption detail + follow-up
`app/(guardian)/adoptions/[id]/page.tsx`
- Adoption summary (pet info, workspace, adopted date)
- Follow-up timeline list
- Submit follow-up form (text + optional images — scope: text only for now)
- API: `GET /api/adoptions/:id`, `GET /api/adoptions/:id/follow-ups`

### F3.5 — Profile settings
`app/(guardian)/profile/page.tsx`
- Edit name, phone
- Change password (separate form)
- API: `PATCH /api/me`, `PATCH /api/me/password`

## Key data shapes

```ts
// Interests
MyInterestListItem { id, message, channel, createdAt, pet: { id, name, species, sex, size, ageCategory, coverImage } }

// Adoptions list
GuardianAdoptionListItem { id, adoptedAt, status, pet: { id, name, species, coverImage }, followUps: [{ id, type, scheduledAt, status, currentSubmission }] }

// Adoption detail
AdoptionDetailsItem { id, status, pet, guardian, workspace, followUps: [{ id, type, status, scheduledAt, currentSubmission }] }

// Me
{ id, fullName, email, role, emailVerified }
```

## Auth guard strategy
Server-side in `layout.tsx` via `getServerPrincipal()` — redirect if null or role ≠ GUARDIAN.

## Acceptance criteria

- [ ] All 5 pages render correctly for a logged-in GUARDIAN
- [ ] Unauthenticated users → redirect to `/login?redirectTo=...`
- [ ] Non-guardian role → redirect to `/`
- [ ] Sidebar navigation highlights active route
- [ ] Responsive — works on mobile and desktop
- [ ] `pnpm lint` passes, `pnpm build` succeeds

## Complexity

**High** — new route group, auth guard, 5 pages, mix of server + client components, React Query for data fetching on client pages.
