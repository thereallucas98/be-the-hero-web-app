# Exploration — F4.5: Workspace Adoption Interests

## Current state

No interests page exists under `(workspace)`. The sidebar (`workspace-sidebar.tsx`) already has a "Interesses" nav item pointing to `/workspaces/${workspaceId}/interests`.

## APIs — all implemented

| Endpoint | Use-case | Return shape |
|---|---|---|
| `GET /api/workspaces/:id/interests` | `listWorkspaceInterests` | `{ items: WorkspaceInterestListItem[], total, page, perPage }` |
| `DELETE /api/workspaces/:id/interests/:interestId` | `dismissAdoptionInterest` | 204 |
| `POST /api/workspaces/:id/interests/:interestId/convert` | `convertInterestToAdoption` | `CreatedAdoptionItem` (201) |

## Data shapes

```ts
WorkspaceInterestListItem {
  id: string
  message: string | null
  createdAt: Date
  pet: { id, name, species, sex, size, ageCategory }
  user: { id, fullName, email }
}

ConvertInterestSchema (body) {
  notes?: string
  adoptedAt?: string (ISO date)
}
```

## Workspace page pattern

`pets/page.tsx` is a **server component** with `getServerPrincipal()` → redirect if unauthenticated → call use-case → render.

However, per the project rule, **all private routes must use React Query + client components**. F4.5 has mutations (dismiss, convert), so it must be a client component with React Query fetching from REST APIs (GraphQL not yet extended for workspace scope — out of scope for this task per the GraphQL brief).

## Auth

`listWorkspaceInterests` requires OWNER/EDITOR membership or SUPER_ADMIN. The middleware doesn't cover workspace routes yet — auth is handled per-page. For the client component, if the API returns 401/403, show an error.

## Sidebar

Already has the "Interesses" link → `/workspaces/${workspaceId}/interests`. No sidebar changes needed.

## Risks

- GraphQL doesn't cover workspace operations yet → use REST fetch with React Query
- Convert action needs a confirm dialog (creates an adoption — significant action)
- `adoptedAt` field in convert: optional, defaults to now — could use a date picker or skip for MVP
