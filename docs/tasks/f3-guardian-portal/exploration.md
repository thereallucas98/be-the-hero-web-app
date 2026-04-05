# Exploration — F3: Guardian Portal

## Current state

No `app/(guardian)/` route group exists. All 5 pages must be created from scratch.

## Key reference files

| File | Role |
|---|---|
| `app/(workspace)/workspaces/[id]/layout.tsx` | Sidebar + main layout pattern |
| `app/(workspace)/workspaces/[id]/pets/page.tsx` | Server component + auth guard pattern |
| `components/features/workspaces/workspace-sidebar.tsx` | Sidebar component to mirror |
| `lib/get-server-principal.ts` | Server-side auth — returns `{ userId, role, memberships, adminCities } | null` |

## Auth guard pattern

The workspace portal redirects in each page via `getServerPrincipal()`. For guardian,
redirect happens in `layout.tsx` so all child pages are protected automatically:

```ts
const principal = await getServerPrincipal()
if (!principal) redirect('/login?redirectTo=/guardian/interests')
if (principal.role !== 'GUARDIAN') redirect('/')
```

## APIs — all implemented

| Endpoint | Used in |
|---|---|
| `GET /api/me/interests?page=&perPage=` | F3.2 |
| `DELETE /api/pets/:petId/interests/:interestId` | F3.2 withdraw action |
| `GET /api/me/adoptions?page=&perPage=` | F3.3 |
| `GET /api/adoptions/:id` | F3.4 |
| `GET /api/adoptions/:id/follow-ups` | F3.4 timeline |
| `POST /api/follow-ups/:id/submissions` | Out of scope — requires file upload |
| `PATCH /api/me` → `{ fullName?, phone? }` | F3.5 |
| `PATCH /api/me/password` → `{ currentPassword, newPassword }` | F3.5 |

## Data shapes

```ts
MyInterestListItem {
  id, message, channel, createdAt,
  pet: { id, name, species, sex, size, ageCategory, coverImage: { url } | null }
}

GuardianAdoptionListItem {
  id, adoptedAt, status, notes,
  pet: { id, name, species, coverImage },
  followUps: [{ id, type, scheduledAt, status, currentSubmission: { status } | null }]
}

AdoptionDetailsItem {
  id, status, adoptedAt, notes, petId, workspaceId, guardianUserId,
  pet: { id, name, description, species, sex, size, ageCategory },
  guardian: { id, fullName, email },
  workspace: { id, name },
  followUps: [{ id, type, status, scheduledAt, currentSubmission: { id, status, submittedAt } | null }]
}
```

## Follow-up submission — out of scope

`POST /api/follow-ups/:id/submissions` requires `photoUrl`, `storagePath`, `mimeType`, `fileSize` — image upload infrastructure not built. F3.4 renders the timeline with status badges only; no submit form.

## Withdraw interest

`DELETE /api/pets/:petId/interests/:interestId` — needs both `petId` and `interestId`. `MyInterestListItem` includes `pet.id`, so both are available. Since withdrawal triggers a list refetch, F3.2 must be a **client component with React Query** (not server-rendered).

## Data fetching strategy

| Page | Strategy | Reason |
|---|---|---|
| F3.2 Interests | React Query (`useQuery`) | Withdraw action → optimistic update / refetch |
| F3.3 Adoptions | Server component | Read-only list, no mutations |
| F3.4 Adoption detail | Server component | Read-only |
| F3.5 Profile | Client component (React Hook Form) | Form mutations |

## URL structure

```
/guardian/interests          ← F3.2
/guardian/adoptions          ← F3.3
/guardian/adoptions/[id]     ← F3.4
/guardian/profile            ← F3.5
```

## Sidebar

New `GuardianSidebar` in `components/features/guardian/guardian-sidebar.tsx` — mirrors `WorkspaceSidebar` pattern (client component, `usePathname`, icon-only nav items).

Nav items: Heart (Interesses), Home (Adoções), User (Perfil). Back → `/`.

## Existing label/badge maps

- Species: already defined in `PetFilterSidebar` constants
- Adoption status: `ACTIVE`, `COMPLETED`, `CANCELLED` — need PT-BR labels
- Follow-up type: `MONTHLY`, `QUARTERLY`, `ANNUAL` — need PT-BR labels
- Follow-up status: `PENDING`, `SUBMITTED`, `APPROVED`, `REJECTED`

## Risks

- `principal.role` from `getServerPrincipal()` is `string`, not a typed enum — compare with `=== 'GUARDIAN'`
- React Query in F3.2: `useQuery` needs `queryFn` to fetch from API route (not direct repo call)
- Guardian portal has no existing design/Figma — build from design language (same as workspace portal)
