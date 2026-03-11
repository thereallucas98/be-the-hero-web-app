## Description

### feat: user profile update (PATCH /me and PATCH /me/password)

Implements sub-step 0.3 of Phase 0 — authenticated user can update their profile and change their password.

---

### What changed

| File | Change |
|------|--------|
| `server/schemas/me.schema.ts` | New — `UpdateMeSchema` (fullName, phone), `ChangePasswordSchema` |
| `server/use-cases/me/update-me.use-case.ts` | New — updates fullName and/or phone |
| `server/use-cases/me/change-password.use-case.ts` | New — verifies current password, sets new hash |
| `server/use-cases/index.ts` | Exported `updateMe`, `changePassword` with types |
| `app/api/me/route.ts` | Added PATCH handler |
| `app/api/me/password/route.ts` | New — PATCH handler |
