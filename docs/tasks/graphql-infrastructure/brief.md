# Task Brief — GraphQL Infrastructure

## Goal

Set up a production-ready GraphQL layer so that all private portal pages
(F3 guardian, F4 workspace, F5 admin) use React Query + GraphQL instead of
direct REST fetch calls.

## What does NOT exist yet

- GraphQL API route (`/api/graphql`)
- Schema / resolvers
- GraphQL client
- Type generation

## What already exists

- `graphql` v16 core package — installed
- Full REST API layer — stays in place (public pages, auth, webhooks use REST)
- Prisma repositories + use-cases — GraphQL resolvers will call these directly

## Chosen stack

| Layer | Package | Reason |
|---|---|---|
| Server | `graphql-yoga` | Lightweight, Next.js App Router native, TypeScript-first, The Guild-maintained |
| Schema builder | `@pothos/core` | Code-first, TypeScript-first, no SDL sync problem |
| Client | `graphql-request` | Lightest GraphQL client, perfect `queryFn` for React Query |
| Type generation | `@graphql-codegen/cli` + `@graphql-codegen/typescript` + `@graphql-codegen/typescript-operations` | Generate TypeScript types from schema + operations |

## Architecture

```
apps/web/src/
  app/api/graphql/route.ts        ← Yoga handler (POST /api/graphql)
  server/graphql/
    schema.ts                     ← Pothos SchemaBuilder + assembled schema
    context.ts                    ← GraphQL context (principal from cookie)
    types/
      user.type.ts                ← Me type + queries/mutations
      interest.type.ts            ← Interest type + queries/mutations
      adoption.type.ts            ← Adoption type + queries
      pet.type.ts                 ← Pet type (shared)
  lib/graphql-client.ts           ← graphql-request client instance (singleton)
  generated/graphql.ts            ← codegen output (types + typed hooks)
```

## Initial schema (guardian portal scope)

### Queries
- `me: User` — current user profile
- `myInterests(page, perPage): InterestPage` — guardian's adoption interests
- `myAdoptions(page, perPage): AdoptionPage` — guardian's adoptions
- `adoption(id: ID!): Adoption` — single adoption detail

### Mutations
- `withdrawInterest(interestId: ID!): Boolean`
- `updateMe(input: UpdateMeInput!): User`
- `changePassword(input: ChangePasswordInput!): Boolean`

## Context

```ts
interface GraphQLContext {
  principal: { userId: string; role: string } | null
}
```

Resolved from `bth_access` cookie via `getServerPrincipal()` on every request.

## Acceptance criteria

- [ ] `POST /api/graphql` accepts GraphQL queries and returns correct data
- [ ] Authentication: unauthenticated queries for private fields return `UNAUTHENTICATED` error
- [ ] All 7 initial operations work (tested via curl/Playground)
- [ ] TypeScript types generated in `src/generated/graphql.ts`
- [ ] `graphql-request` client exported from `~/lib/graphql-client`
- [ ] `pnpm codegen` script added to `package.json`
- [ ] `pnpm lint` passes, `pnpm build` succeeds

## Out of scope

- GraphQL subscriptions
- File uploads via GraphQL
- Workspace/admin schema (added when F4/F5 are built)
- GraphQL Playground in production (dev-only)

## Complexity

**Medium-High** — new infrastructure layer, schema design, codegen setup, but no new business logic (resolvers call existing use-cases).
