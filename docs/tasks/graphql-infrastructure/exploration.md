# Exploration — GraphQL Infrastructure

## Current state

No GraphQL layer exists. `graphql` v16 is already installed as a production dependency. No Yoga, Pothos, graphql-request, or codegen packages are installed. No `/api/graphql` route exists.

## Installed packages (relevant)

| Package | Version | Note |
|---|---|---|
| `graphql` | ^16.12.0 | Already installed — core engine |
| All others | — | Need to be installed |

## Auth utilities — what each one does

### `lib/session.ts`
- `getAccessTokenFromCookie(cookieHeader: string): string | null` — parses `bth_access` from raw `Cookie:` header string
- `verifyAccessToken(token: string): JwtPayload` — JWT verify using `JWT_SECRET`; throws on invalid/expired

### `lib/auth.ts`
- `JwtPayload = { sub: string; role: Role }` — imported from `@bethehero/auth`

### `lib/get-server-principal.ts`
- Uses `next/headers` `cookies()` — **Server Components only, not middleware**
- Queries Prisma for user (checks `isActive`)
- Returns `{ userId, role, memberships, adminCities } | null`

### `lib/get-principal.ts`
- Used in API routes; reads `bth_access` from `Request` headers
- Also queries Prisma

## GraphQL context strategy

The context factory for Yoga will run on **every request**. Two options:

**Option A — JWT decode only (no Prisma):**
```ts
// Fast, Edge-compatible if needed, but principal has no isActive check
const payload = verifyAccessToken(token) // → { sub, role }
return { principal: { userId: payload.sub, role: payload.role } }
```

**Option B — Full Prisma lookup (mirrors getServerPrincipal):**
```ts
// Full user load: isActive check, memberships, adminCities
const principal = await getPrincipalFromToken(token, prisma)
```

**Decision: Option B** — GraphQL resolvers need the same `principal` shape as REST use-cases (`userId`, `role`, `memberships`, `adminCities`). The `isActive` check is important for deactivated accounts. Prisma is already used in the REST API routes with no performance issues.

The context function will mirror `getServerPrincipal()` logic: verify JWT → query user → return principal or null.

## Middleware — guardian route protection

`apps/web/src/middleware.ts` currently has `matcher: []` (disabled). For guardian routes:

**JWT decode in middleware is safe** — JWT payload contains `role` directly. No Prisma query needed for the route guard (just presence + role check).

```ts
// middleware.ts approach
const token = req.cookies.get('bth_access')?.value
if (!token) { redirect to login }
const payload = verifyAccessToken(token) // only decode, no DB
if (payload.role !== 'GUARDIAN') { redirect to / }
```

**Constraint**: `verifyAccessToken` uses `jsonwebtoken` which depends on Node.js `crypto`. Must ensure middleware runs in **Node.js runtime** (not Edge runtime). Next.js defaults to Node.js for middleware unless `export const runtime = 'edge'` is declared — so this is safe.

## Use-cases available for the 7 initial operations

| Operation | Use-case | File |
|---|---|---|
| `me` query | `getMe(userRepo, userId)` | `me/get-me.use-case.ts` |
| `myInterests` query | `listMyInterests(interestRepo, principal, input)` | `adoption-interests/list-my-interests.use-case.ts` |
| `myAdoptions` query | `listGuardianAdoptions(followUpRepo, principal, input)` | `follow-ups/list-guardian-adoptions.use-case.ts` |
| `adoption` query | `getAdoptionById(adoptionRepo, principal, { adoptionId })` | `adoptions/get-adoption-by-id.use-case.ts` |
| `withdrawInterest` mutation | `withdrawAdoptionInterest(interestRepo, principal, { interestId })` | `adoption-interests/withdraw-adoption-interest.use-case.ts` |
| `updateMe` mutation | `updateMe(userRepo, { userId, fullName?, phone? })` | `me/update-me.use-case.ts` |
| `changePassword` mutation | `changePassword(userRepo, { userId, email, currentPassword, newPassword })` | `me/change-password.use-case.ts` |

All use-cases follow discriminated union pattern: `{ success: true; ... } | { success: false; code: string }`.

## Repositories needed by resolvers

```
userRepo         ← createUserRepository(prisma)
interestRepo     ← createAdoptionInterestRepository(prisma)
followUpRepo     ← createFollowUpRepository(prisma)
adoptionRepo     ← createAdoptionRepository(prisma)
```

All repository factory functions exist and follow the same pattern. The GraphQL context will instantiate all four repositories once per request.

## Pothos SchemaBuilder — type mapping

The guardian-scope schema maps to these Prisma/use-case types:

```
User         → GetMeResult.user  { id, fullName, email, role, emailVerified }
Interest     → MyInterestListItem  { id, message, channel, createdAt, pet: { id, name, ... } }
InterestPage → { items: Interest[], total, page, perPage }
Adoption     → AdoptionDetailsItem  { id, status, adoptedAt, notes, pet, guardian, workspace, followUps }
AdoptionPage → { items: GuardianAdoptionListItem[], total, page, perPage }
FollowUp     → { id, type, status, scheduledAt, currentSubmission: { id, status, submittedAt } | null }
Pet (shared) → { id, name, species, sex, size, ageCategory, coverImage: { url } | null }
```

## graphql-request client

Will be a singleton module at `lib/graphql-client.ts`:
```ts
import { GraphQLClient } from 'graphql-request'
export const graphqlClient = new GraphQLClient('/api/graphql', {
  credentials: 'include', // sends bth_access cookie automatically
})
```

No manual token threading needed — the browser sends the `httpOnly` cookie on every same-origin fetch.

## Codegen setup

Config file: `apps/web/codegen.ts`
- Schema: introspected from running dev server OR from schema file path
- Documents: `apps/web/src/**/*.graphql` (operations defined by features)
- Output: `apps/web/src/generated/graphql.ts`
- Plugins: `typescript` + `typescript-operations`

Script in `apps/web/package.json`:
```json
"codegen": "graphql-codegen --config codegen.ts"
```

## Key files to create

```
apps/web/src/
  app/api/graphql/route.ts
  server/graphql/
    schema.ts
    context.ts
    types/
      user.type.ts
      interest.type.ts
      adoption.type.ts
  lib/graphql-client.ts
  generated/graphql.ts          ← codegen output (not hand-written)
apps/web/codegen.ts
```

## Files to modify

| File | Change |
|---|---|
| `apps/web/src/middleware.ts` | Add guardian route protection (decode JWT, check role) |
| `apps/web/package.json` | Add `codegen` script |

## Risks

- **Pothos + graphql-yoga peer deps**: Both require `graphql` ^16 — already satisfied
- **codegen schema source**: Codegen needs the schema available at codegen time. Best approach: point codegen at the Pothos-built schema file directly via a script that exports it, or use `@graphql-codegen/schema-ast` to read from a generated SDL file
- **`Date` scalars**: Pothos needs a custom `Date` scalar or use `String` for `DateTime` fields — use `String` (ISO 8601) to keep it simple
- **`changePassword` needs `email`**: The use-case needs `email` to call `findByEmailForLogin`. The resolver must fetch the user's email from context (principal has `userId` not `email`) — need a `userRepo.findById` call in the resolver to get email, or extend the context to include email
- **codegen watch mode**: Running `pnpm codegen --watch` requires the server to be up; for CI, run against the schema file
