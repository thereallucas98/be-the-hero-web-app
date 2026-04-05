# Plan — GraphQL Infrastructure

## Sub-steps

### Step 1 — Install dependencies

Install all required packages in `apps/web/`:

**Production:**
- `graphql-yoga` — Yoga server
- `@pothos/core` — Schema builder
- `@pothos/plugin-simple-objects` — Simple object type definitions
- `graphql-request` — Client for frontend

**Dev:**
- `@graphql-codegen/cli` — Codegen CLI
- `@graphql-codegen/typescript` — Generate TS types from schema
- `@graphql-codegen/typescript-operations` — Generate TS types from operations

**Files changed:** `apps/web/package.json`, `pnpm-lock.yaml`

---

### Step 2 — Pothos SchemaBuilder + DateTime scalar

Create the schema builder with `simple-objects` plugin and a custom `DateTime` scalar.

**Files created:**
- `apps/web/src/server/graphql/builder.ts` — SchemaBuilder instance with `DateTime` scalar

---

### Step 3 — GraphQL context factory

Create the context factory that:
1. Reads `bth_access` cookie from request
2. Verifies JWT
3. Queries Prisma for user (with email, role, memberships, adminCities)
4. Instantiates repositories
5. Returns `{ principal, repos }`

**Files created:**
- `apps/web/src/server/graphql/context.ts`

---

### Step 4 — Pothos types (User, Pet, Interest, Adoption, FollowUp)

Define all GraphQL object types that map to use-case return shapes:
- `User` — from `GetMeResult.user` + email
- `Pet` — shared pet shape (id, name, species, sex, size, ageCategory, coverImage)
- `PetImage` — `{ url }`
- `Interest` — from `MyInterestListItem`
- `InterestPage` — paginated wrapper
- `GuardianAdoption` — from `GuardianAdoptionListItem` (list item with follow-up summaries)
- `GuardianAdoptionPage` — paginated wrapper
- `Adoption` — from `AdoptionDetailsItem` (full detail)
- `FollowUp` — `{ id, type, status, scheduledAt, currentSubmission }`
- `FollowUpSubmission` — `{ id, status, submittedAt }`
- `Workspace` — `{ id, name }` (referenced in adoption detail)
- `Guardian` — `{ id, fullName, email }` (referenced in adoption detail)

**Files created:**
- `apps/web/src/server/graphql/types/user.type.ts`
- `apps/web/src/server/graphql/types/pet.type.ts`
- `apps/web/src/server/graphql/types/interest.type.ts`
- `apps/web/src/server/graphql/types/adoption.type.ts`

---

### Step 5 — Queries (me, myInterests, myAdoptions, adoption)

Add query fields to the schema:

| Query | Use-case | Auth |
|---|---|---|
| `me` | `getMe(userRepo, userId)` | Required |
| `myInterests(page, perPage)` | `listMyInterests(interestRepo, principal, input)` | Required |
| `myAdoptions(page, perPage)` | `listGuardianAdoptions(followUpRepo, principal, input)` | Required |
| `adoption(id)` | `getAdoptionById(adoptionRepo, principal, { adoptionId })` | Required |

Each resolver: check `ctx.principal`, call use-case, throw `GraphQLError` on failure.

**Files created:**
- `apps/web/src/server/graphql/queries/me.query.ts`
- `apps/web/src/server/graphql/queries/interests.query.ts`
- `apps/web/src/server/graphql/queries/adoptions.query.ts`

---

### Step 6 — Mutations (withdrawInterest, updateMe, changePassword)

| Mutation | Use-case | Auth |
|---|---|---|
| `withdrawInterest(interestId)` | `withdrawAdoptionInterest(interestRepo, principal, { interestId })` | Required |
| `updateMe(input)` | `updateMe(userRepo, { userId, fullName?, phone? })` | Required |
| `changePassword(input)` | `changePassword(userRepo, { userId, email, currentPassword, newPassword })` | Required |

Input types:
- `UpdateMeInput { fullName: String, phone: String }`
- `ChangePasswordInput { currentPassword: String!, newPassword: String! }`

**Files created:**
- `apps/web/src/server/graphql/mutations/interests.mutation.ts`
- `apps/web/src/server/graphql/mutations/me.mutation.ts`

---

### Step 7 — Assemble schema + Yoga route handler

1. Create `schema.ts` that imports all type/query/mutation files and builds the schema
2. Create `app/api/graphql/route.ts` with Yoga handler (GraphiQL in dev only)

**Files created:**
- `apps/web/src/server/graphql/schema.ts`
- `apps/web/src/app/api/graphql/route.ts`

---

### Step 8 — graphql-request client

Create singleton client at `lib/graphql-client.ts` with `credentials: 'include'` for cookie auth.

**Files created:**
- `apps/web/src/lib/graphql-client.ts`

---

### Step 9 — Codegen setup

1. Create `codegen.ts` config file
2. Create `scripts/export-schema.ts` to write SDL from Pothos schema
3. Create initial `.graphql` operation files in `src/graphql/operations/`
4. Add `codegen` script to `package.json`
5. Run codegen to generate `src/generated/graphql.ts`

**Files created:**
- `apps/web/codegen.ts`
- `apps/web/scripts/export-schema.ts`
- `apps/web/src/graphql/operations/me.graphql`
- `apps/web/src/graphql/operations/interests.graphql`
- `apps/web/src/graphql/operations/adoptions.graphql`
- `apps/web/src/generated/graphql.ts` (auto-generated)
- `apps/web/schema.graphql` (auto-generated SDL)

**Files modified:**
- `apps/web/package.json` — add `"codegen"` script

---

### Step 10 — QA: curl tests for all 7 operations

Test via curl against running dev server:
1. Login as guardian → get cookie
2. `me` query
3. `myInterests` query (with pagination)
4. `myAdoptions` query (with pagination)
5. `adoption(id)` query
6. `withdrawInterest` mutation
7. `updateMe` mutation
8. `changePassword` mutation
9. Unauthenticated request → `UNAUTHENTICATED` error
10. Invalid query → proper error response

**Files created:**
- `docs/tasks/graphql-infrastructure/validation.md`

---

### Step 11 — Lint + Build validation

```bash
pnpm lint    # Must pass (0 warnings)
pnpm build   # Must succeed
```

---

## Test strategy

- **Functional**: curl tests against `POST /api/graphql` for all 7 operations
- **Auth**: unauthenticated requests return `UNAUTHENTICATED` code
- **Error handling**: invalid IDs return `NOT_FOUND`, wrong password returns `WRONG_PASSWORD`
- **Codegen**: `pnpm codegen` runs without errors, generates valid TypeScript
- **Browser QA checklist**: GraphiQL accessible at `/api/graphql` in dev browser

## Out of scope (confirmed)

- Middleware update for guardian routes — will be done in F3 task
- Workspace/admin GraphQL schema — added when F4/F5 are built
- Subscriptions, file uploads
