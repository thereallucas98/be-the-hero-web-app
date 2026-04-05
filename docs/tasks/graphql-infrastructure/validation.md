# Validation — GraphQL Infrastructure

## QA Curl Tests

| # | Test | Expected | Result |
|---|---|---|---|
| 1 | `me` query (unauthenticated) | `UNAUTHENTICATED` error | ✅ |
| 2 | `me` query (authenticated guardian) | Returns user data | ✅ |
| 3 | `myInterests(page, perPage)` | Returns paginated interests with pet data | ✅ |
| 4 | `myAdoptions(page, perPage)` | Returns paginated adoptions with follow-ups | ✅ |
| 5 | `adoption(id)` | Returns full adoption detail with pet, guardian, workspace, follow-ups | ✅ |
| 6 | `updateMe(input)` | Returns updated user | ✅ |
| 7 | `changePassword(input)` — wrong password | `WRONG_PASSWORD` error | ✅ |
| 8 | `adoption(id)` — non-existent ID | `NOT_FOUND` error | ✅ |
| 9 | Invalid query field | `GRAPHQL_VALIDATION_FAILED` error | ✅ |
| 10 | `withdrawInterest(interestId)` | Returns `true` | ✅ |

## Acceptance Criteria

| Criteria | Status |
|---|---|
| `POST /api/graphql` accepts GraphQL queries and returns correct data | ✅ |
| Authentication: unauthenticated queries for private fields return `UNAUTHENTICATED` error | ✅ |
| All 7 initial operations work (tested via curl) | ✅ |
| TypeScript types generated in `src/generated/graphql.ts` | ✅ |
| `graphql-request` client exported from `~/lib/graphql-client` | ✅ |
| `pnpm codegen` script added to `package.json` | ✅ |
| `pnpm lint` passes | ✅ |
| `pnpm build` succeeds | ✅ |

## Build Output

`/api/graphql` route visible in build output as dynamic (`ƒ`) route.

## Notes

- GraphiQL playground accessible at `GET /api/graphql` in dev (disabled in production)
- ESLint configured to ignore `src/generated/` directory (codegen output)
- Schema exported to `schema.graphql` SDL file for codegen (not introspection)
