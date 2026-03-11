## Description

### feat: password reset, email verification, and API docs

Implements sub-steps 0.1 and 0.2 of Phase 0 (Complete Auth & User/Org), plus Swagger documentation setup and a route conflict fix.

---

### What changed

| Area | Change |
|------|--------|
| **0.1 — Password Reset** | |
| `lib/auth.ts` | Added `generateToken()` (sha256 hashed), `signEmailVerifyToken()`, `verifyEmailVerifyToken()` |
| `user.repository.ts` | Added `findByResetToken`, `setResetToken`, `clearResetToken`, `setEmailVerified`, `updateProfile`, `updatePassword`, `findEmailVerifiedById` |
| `auth.schema.ts` | Added `ForgotPasswordSchema`, `ResetPasswordSchema`, `VerifyEmailSchema` |
| `use-cases/auth/forgot-password.use-case.ts` | New — always returns 200, no email enumeration |
| `use-cases/auth/reset-password.use-case.ts` | New — validates sha256 token, clears after use |
| `app/api/auth/forgot-password/route.ts` | New — POST |
| `app/api/auth/reset-password/route.ts` | New — POST |
| **0.2 — Email Verification** | |
| `use-cases/auth/verify-email.use-case.ts` | New — validates signed JWT (24h), sets emailVerified |
| `use-cases/auth/resend-verification.use-case.ts` | New — requires auth, blocks if already verified |
| `app/api/auth/verify-email/route.ts` | New — POST |
| `app/api/auth/resend-verification/route.ts` | New — POST |
| **Swagger** | |
| `lib/swagger.ts` | Translated to English, dynamic server URL (`/`) |
| `app/api/api-docs/route.ts` | Dynamic CORS origin from request host |
| `lib/swagger/definitions/auth.ts` | All auth endpoints with request body examples |
| `lib/swagger/definitions/me.ts` | PATCH /me and PATCH /me/password documented |
| `lib/swagger/definitions/workspaces.ts` | Full workspace endpoints with examples and parameters |
| `lib/swagger/definitions/pets.ts` | Translated to English, added examples |
| `lib/swagger/definitions/adoptions.ts` | Translated to English, added examples |
| `lib/swagger/definitions/admin.ts` | Translated to English, added examples |
| `app/api-docs/page.tsx` | Translated to English |
| **Bug fix** | |
| `app/api/pets/[id]/images/[imageId]/route.ts` | Moved from `[petId]` — fixes Next.js slug conflict crash on startup |
