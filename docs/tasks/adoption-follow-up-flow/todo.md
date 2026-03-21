# TODO: Adoption Follow-up Flow

**Date**: 2026-03-21
**Phase**: PLANNING
**Status**: Pending Approval

---

## Implementation Checklist

### Phase 1: Repository + Schemas

- [ ] **1.1** `follow-up.repository.ts` — new file: interface + all 8 methods
- [ ] **1.2** `schemas/follow-up.schema.ts` — new file: all 4 schemas
- [ ] **1.3** `server/repositories/index.ts` — export `followUpRepository`

### Sub-step 3.1 — List Adoption Follow-ups

- [ ] **2.1** `use-cases/follow-ups/list-adoption-follow-ups.use-case.ts` — NEW
- [ ] **2.2** `app/api/adoptions/[id]/follow-ups/route.ts` — NEW (GET)

> **QA gate 3.1**

### Sub-step 3.2 — Guardian Submits Follow-up

- [ ] **3.1** `use-cases/follow-ups/submit-follow-up.use-case.ts` — NEW
- [ ] **3.2** `app/api/follow-ups/[id]/submissions/route.ts` — NEW (POST)

> **QA gate 3.2**

### Sub-step 3.3 — Admin List Submissions

- [ ] **4.1** `use-cases/follow-ups/list-follow-up-submissions-admin.use-case.ts` — NEW
- [ ] **4.2** `app/api/admin/follow-up-submissions/route.ts` — NEW (GET)

> **QA gate 3.3**

### Sub-step 3.4 — Admin Approve/Reject

- [ ] **5.1** `use-cases/follow-ups/approve-follow-up-submission.use-case.ts` — NEW
- [ ] **5.2** `use-cases/follow-ups/reject-follow-up-submission.use-case.ts` — NEW
- [ ] **5.3** `app/api/admin/follow-up-submissions/[id]/approve/route.ts` — NEW (POST)
- [ ] **5.4** `app/api/admin/follow-up-submissions/[id]/reject/route.ts` — NEW (POST)

> **QA gate 3.4**

### Sub-step 3.5 — Guardian List Own Adoptions

- [ ] **6.1** `use-cases/follow-ups/list-guardian-adoptions.use-case.ts` — NEW
- [ ] **6.2** `app/api/me/adoptions/route.ts` — NEW (GET)

> **QA gate 3.5**

### Wiring + Docs

- [ ] **7.1** `server/use-cases/index.ts` — export all 6 use cases
- [ ] **7.2** `lib/swagger/definitions/follow-ups.ts` — NEW: Swagger JSDoc for all 6 endpoints
- [ ] **7.3** `pnpm lint` — 0 errors, 0 warnings
- [ ] **7.4** `pnpm build` — succeeds

---

## Progress Notes

| Step | Status | Notes |
|------|--------|-------|
| 1.1–1.3 | Pending | |
| 2.1–2.2 | Pending | QA gate 3.1 |
| 3.1–3.2 | Pending | QA gate 3.2 |
| 4.1–4.2 | Pending | QA gate 3.3 |
| 5.1–5.4 | Pending | QA gate 3.4 |
| 6.1–6.2 | Pending | QA gate 3.5 |
| 7.1–7.4 | Pending | |
