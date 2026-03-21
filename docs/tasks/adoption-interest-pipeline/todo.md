# Todo: Adoption Interest Pipeline

**Date**: 2026-03-21
**Phase**: EXECUTION

---

## Checklist

### Step 1 — Repository + Schemas
- [ ] Add `InterestItem`, `InterestForWorkspaceItem`, `MyInterestListItem`, `ListMyInterestsResult` types to `adoption-interest.repository.ts`
- [ ] Add `findById(id)` method
- [ ] Add `findByIdForWorkspace(id, workspaceId)` method
- [ ] Add `findByUserId(userId, { page, perPage })` method
- [ ] Add `deleteById(id)` method
- [ ] Create `server/schemas/adoption-interest.schema.ts` with `ListMyInterestsQuerySchema` + `ConvertInterestSchema`

### Step 2 — List My Interests
- [ ] Create `use-cases/adoption-interests/list-my-interests.use-case.ts`
- [ ] Create `app/api/me/interests/route.ts` (GET)
- [ ] ✅ QA gate A.1

### Step 3 — Withdraw Interest
- [ ] Create `use-cases/adoption-interests/withdraw-adoption-interest.use-case.ts`
- [ ] Create `app/api/pets/[id]/interests/[interestId]/route.ts` (DELETE)
- [ ] ✅ QA gate A.2

### Step 4 — Convert Interest to Adoption
- [ ] Create `use-cases/adoption-interests/convert-interest-to-adoption.use-case.ts`
- [ ] Create `app/api/workspaces/[id]/interests/[interestId]/route.ts` (POST)
- [ ] ✅ QA gate A.3

### Step 5 — Dismiss Interest
- [ ] Create `use-cases/adoption-interests/dismiss-adoption-interest.use-case.ts`
- [ ] Add DELETE handler to `app/api/workspaces/[id]/interests/[interestId]/route.ts`
- [ ] ✅ QA gate A.4

### Step 6 — Wire + Swagger + Validation
- [ ] Export 4 new use cases from `server/use-cases/index.ts`
- [ ] Create `lib/swagger/definitions/adoption-interests.ts`
- [ ] `pnpm lint` — 0 errors, 0 warnings
- [ ] `pnpm build` — succeeds
