# TODO — GraphQL Infrastructure

- [x] Step 1: Install dependencies (graphql-yoga, @pothos/core, @pothos/plugin-simple-objects, graphql-request, codegen packages)
- [x] Step 2: Create Pothos SchemaBuilder + DateTime scalar (`server/graphql/builder.ts`)
- [x] Step 3: Create GraphQL context factory (`server/graphql/context.ts`)
- [x] Step 4: Define Pothos types — User, Pet, Interest, Adoption, FollowUp, etc.
- [x] Step 5: Add queries — me, myInterests, myAdoptions, adoption
- [x] Step 6: Add mutations — withdrawInterest, updateMe, changePassword
- [x] Step 7: Assemble schema + create Yoga route handler (`/api/graphql`)
- [x] Step 8: Create graphql-request client (`lib/graphql-client.ts`)
- [x] Step 9: Codegen setup — config, export script, operations, generate types
- [x] Step 10: QA curl tests for all 7 operations
- [x] Step 11: Lint + build validation
