# Task Brief — F4.5: Workspace Adoption Interests

## User Story

> As a workspace partner (OWNER/EDITOR), I want to see incoming adoption interests from guardians,
> dismiss those I won't pursue, and convert promising ones into adoptions.

## Scope

Build the workspace interests page at `app/(workspace)/workspaces/[id]/interests/page.tsx`.

## Features

- List adoption interests for the workspace (paginated)
- Each interest shows: guardian name, email, pet name, species, message, date
- Dismiss interest action (DELETE — removes the interest)
- Convert to adoption action (POST — creates adoption, deletes interest)
- Convert modal/form: optional notes, optional adoptedAt date

## APIs (all implemented)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/workspaces/:id/interests?page=&perPage=` | GET | List interests |
| `/api/workspaces/:id/interests/:interestId` | DELETE | Dismiss interest |
| `/api/workspaces/:id/interests/:interestId/convert` | POST | Convert to adoption |

## Key data shape

```ts
WorkspaceInterestListItem {
  id, message, createdAt,
  pet: { id, name, species, sex, size, ageCategory },
  user: { id, fullName, email }
}
```

## Acceptance criteria

- [ ] Interests list loads for workspace OWNER/EDITOR
- [ ] Dismiss removes interest from list
- [ ] Convert creates adoption and removes interest
- [ ] Empty state when no interests
- [ ] Pagination works
- [ ] `pnpm lint` passes, `pnpm build` succeeds

## Complexity

**Medium** — single page, two actions, existing APIs and patterns from F3.
