# Research — GraphQL Infrastructure

## Decision 1 — Yoga handler: App Router route handler vs Pages API route

**Options:**
- A) `app/api/graphql/route.ts` — App Router route handler, `export { handler as GET, handler as POST }`
- B) `pages/api/graphql.ts` — Pages Router API route

**Decision: A — App Router route handler.**

Project uses Next.js 16 App Router exclusively. All existing API routes live in `app/api/`. Yoga has first-class support for Next.js App Router via `createYoga()` returning a standard `Request → Response` handler.

---

## Decision 2 — GraphQL context: JWT-only vs full Prisma lookup

**Options:**
- A) JWT decode only — `{ userId: payload.sub, role: payload.role }` — fast, no DB call
- B) Full Prisma lookup — mirrors `getServerPrincipal()` with `isActive` check, memberships, adminCities

**Decision: B — full Prisma lookup.**

Resolvers like `getAdoptionById` require `principal.memberships` and `principal.adminCities` for authorization. JWT only carries `sub` and `role`. Without memberships/adminCities, we'd have to look them up in every resolver that needs them — worse than one context query per request.

The context factory will:
1. Parse `bth_access` cookie from the request
2. `verifyAccessToken(token)` → JWT payload
3. Query Prisma for user (same select as `getServerPrincipal`)
4. Return `{ principal: Principal | null, repos: { userRepo, interestRepo, ... } }`

Repositories are also created once in context — resolvers receive them from `ctx.repos`.

---

## Decision 3 — `changePassword` email problem

The `changePassword` use-case requires `email` to call `userRepo.findByEmailForLogin()`. The JWT principal only has `userId`, not `email`.

**Options:**
- A) Extend context to include `email` (add `email` to the Prisma user select in context factory)
- B) Have the resolver do an extra `userRepo.findByIdForMe(userId)` call to get the email
- C) Add a `findByIdForPassword(id)` method to `UserRepository` that returns `{ email }`

**Decision: A — extend context.**

The simplest approach. The context Prisma query already fetches the user — just add `email` to the `select`. No extra DB call, no new repository method. The context `principal` shape becomes:

```ts
{ userId, email, role, memberships, adminCities }
```

This also benefits `updateMe` and the `me` query — email is immediately available without an extra fetch.

---

## Decision 4 — Date handling in GraphQL schema

**Options:**
- A) Custom `DateTime` scalar that serializes `Date` to ISO 8601 string
- B) Use `String` type for all date fields, manually serialize in resolvers

**Decision: A — custom `DateTime` scalar.**

Pothos supports custom scalars easily. A `DateTime` scalar keeps the schema self-documenting and handles serialization/parsing in one place. ISO 8601 strings are what the frontend expects (same as current REST responses where `Date` objects are JSON-serialized to strings).

---

## Decision 5 — Codegen schema source

**Options:**
- A) Introspect from running dev server (`http://localhost:3001/api/graphql`) — requires server up
- B) Export Pothos schema to SDL file, codegen reads the file — works offline
- C) Use `@graphql-codegen/schema-ast` plugin to write SDL + standard codegen reads it

**Decision: B — export schema to SDL file.**

Create a small script (`scripts/export-schema.ts`) that imports the Pothos schema and writes `schema.graphql`. Codegen config reads from this file. Benefits:
- Works without dev server running (CI-friendly)
- Can be committed for easy review of schema changes
- `pnpm codegen` = `tsx scripts/export-schema.ts && graphql-codegen`

---

## Decision 6 — Error handling in resolvers

**Options:**
- A) Return `null` for failures, let client check
- B) Throw `GraphQLError` with specific `extensions.code` values
- C) Union types (`UserResult = User | Error`) for every operation

**Decision: B — throw `GraphQLError` with codes.**

Use-cases already return `{ success: false; code: string }`. Resolvers map these to `GraphQLError`:

```ts
if (!result.success) {
  throw new GraphQLError('...', { extensions: { code: result.code } })
}
```

Standard codes: `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `WRONG_PASSWORD`. This is the GraphQL community standard (Apollo/Yoga both support `extensions.code`). Union types add unnecessary complexity for the initial scope.

---

## Decision 7 — Pothos plugins

**Options:**
- A) `@pothos/core` only — manual everything
- B) `@pothos/core` + `@pothos/plugin-simple-objects` — easier type definition without full Prisma plugin
- C) `@pothos/core` + `@pothos/plugin-prisma` — auto-generates types from Prisma schema

**Decision: B — core + simple-objects.**

`plugin-prisma` is powerful but adds tight coupling between Prisma schema and GraphQL schema. Since resolvers call use-cases (not Prisma directly), the Prisma schema shape doesn't map 1:1 to the GraphQL schema. `simple-objects` lets us define types from the use-case return shapes cleanly.

---

## Decision 8 — Operations file format for codegen

**Options:**
- A) `.graphql` files alongside components (`interests-page.graphql`)
- B) Tagged template literals in `.ts` files (`gql` tag)
- C) Centralized `operations/` directory with `.graphql` files per domain

**Decision: C — centralized `operations/` directory.**

```
apps/web/src/graphql/
  operations/
    me.graphql
    interests.graphql
    adoptions.graphql
```

Keeps operations organized by domain, easy to find, and codegen scans one directory. Components import the generated typed documents from `~/generated/graphql`.

---

## Decision 9 — GraphQL Playground in dev

**Options:**
- A) Yoga's built-in GraphiQL (enabled by default in dev)
- B) Disable entirely
- C) Use external tool (Insomnia, Postman)

**Decision: A — Yoga's built-in GraphiQL.**

Yoga enables GraphiQL automatically when `NODE_ENV !== 'production'`. Zero config. Access via `GET /api/graphql` in the browser. Disable in production via Yoga's `graphiql: false` option when `process.env.NODE_ENV === 'production'`.

---

## Summary

| Aspect | Decision |
|---|---|
| Handler | App Router `route.ts` with Yoga |
| Context | Full Prisma lookup (principal + repos), email included in principal |
| Date fields | Custom `DateTime` scalar (ISO 8601) |
| Schema source | Export to SDL file, codegen reads file |
| Error handling | `GraphQLError` with `extensions.code` |
| Pothos plugins | `core` + `simple-objects` |
| Operations format | `.graphql` files in `src/graphql/operations/` |
| Playground | Yoga built-in GraphiQL (dev only) |
| changePassword | Email from extended context principal |
