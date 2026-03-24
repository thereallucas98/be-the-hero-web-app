# Frontend Plan — Auth Flow (Login / Register)

**Date**: 2026-03-24
**Phase**: PLANNING
**Status**: Pending Approval

---

## Objective

Wire the complete auth frontend to the backend APIs already in place.
Backend is 100% done. This plan covers all missing/incomplete pages and components.

---

## Current State

| File | Status | Gaps |
|---|---|---|
| `(auth)/login/page.tsx` + `LoginForm` | ✅ Wired | No "Esqueceu a senha?" link, no `?redirectTo=` support |
| `(auth)/register/page.tsx` + `RegisterForm` | ⚠️ Partially wired | `whatsapp` field discarded, always PARTNER_MEMBER, no workspace step, redirects to `/login` instead of verify |
| `(auth)/forgot-password/page.tsx` | ❌ Missing | — |
| `(auth)/reset-password/page.tsx` | ❌ Missing | — |
| `(auth)/verify-email/page.tsx` | ❌ Missing | — |
| `/register/guardian` | ❌ Missing | Guardian registration flow |

---

## Architecture

```
app/(auth)/
  login/page.tsx                  ← F2.1: add "Esqueceu a senha?" + redirectTo
  register/
    page.tsx                      ← F2.3: refactor → 2-step org form
    guardian/page.tsx             ← F2.2: new guardian registration
  forgot-password/page.tsx        ← F2.5a: new page
  reset-password/page.tsx         ← F2.5b: new page
  verify-email/page.tsx           ← F2.4: new page (auto-verify + resend)

components/features/auth/
  login-form.tsx                  ← F2.1: update (forgot link + redirect)
  register-form.tsx               ← F2.3: refactor (2-step org flow)
  register-guardian-form.tsx      ← F2.2: new
  forgot-password-form.tsx        ← F2.5a: new
  reset-password-form.tsx         ← F2.5b: new
  verify-email-view.tsx           ← F2.4: new (client, handles token + resend)
  auth-card.tsx                   ← shared page wrapper (illustration + form layout)
```

---

## Sub-steps

### F2.1 — Login refinements

**What:**
- Add "Esqueceu a senha?" link pointing to `/forgot-password` (below password field)
- Read `?redirectTo=` from `useSearchParams()` → after login, `router.push(redirectTo || '/')`
- Add `?role=guardian` aware register link (links to `/register/guardian` vs `/register`)

**Components changed:** `login-form.tsx`

**API:** `POST /api/auth/login` (already wired)

---

### F2.2 — Register Guardian

**What:**
- Create `register/guardian/page.tsx` (same layout pattern as existing `/register`)
- Create `RegisterGuardianForm` (`components/features/auth/register-guardian-form.tsx`)
  - Fields: fullName, email, `PhoneInput` (whatsapp), password, confirmPassword
  - POST `/api/auth/register` with `role: 'GUARDIAN'`
  - On success → redirect to `/verify-email?pending=true`
  - On `EMAIL_IN_USE` (409) → `setError('root', 'Este email já está em uso')`
- Update `/login` register CTA: show both "Org" and "Guardian" options OR keep as org-only with guardian link in footer
- Update `LoginForm` secondary button: keep "Cadastrar minha organização" → `/register`; add smaller link "É adotante? Cadastre-se aqui" → `/register/guardian`

**Components:** `register-guardian-form.tsx` (new)

**API:** `POST /api/auth/register`

---

### F2.3 — Register Organization (refactor + workspace step)

**What:**
- Refactor `RegisterForm` into a 2-step flow:
  - **Step 1** — user details: fullName, email, `PhoneInput` (phone), password, confirmPassword
    - POST `/api/auth/register` with `role: 'PARTNER_MEMBER'`
    - On success: cookie is set → move to Step 2 (in-memory `workspaceId = null`, user created)
  - **Step 2** — workspace details: orgName (name), CNPJ (`CnpjInput`), phone (`PhoneInput`)
    - POST `/api/workspaces` (authenticated via cookie set in step 1)
    - On success → redirect to `/workspaces/:id/pets`
- Use `useState<1|2>` to control steps; no page navigation between steps
- Remove the `whatsapp` field from step 1 (replaced by `phone`)
- Show step indicator: "1 de 2 — Dados pessoais" / "2 de 2 — Sua organização"
- On step 2 API error → `setError('root', ...)` with message

**Components:** `register-form.tsx` (refactor)

**API:**
- `POST /api/auth/register` (step 1)
- `POST /api/workspaces` (step 2)

---

### F2.4 — Email verification page

**What:**
- Create `app/(auth)/verify-email/page.tsx` (server component wrapper)
- Create `VerifyEmailView` (`components/features/auth/verify-email-view.tsx`) — client component
  - Reads `?token=` and `?pending=true` from `useSearchParams()`
  - **If `token` present:** on mount → POST `/api/auth/verify-email` with `{ token }`
    - Loading state → spinner + "Verificando…"
    - Success → "Email verificado! Redirecionando…" → `router.push('/')`
    - Error (400) → "Link inválido ou expirado." + "Reenviar email" button
  - **If `pending=true` (no token):** static state → "Verifique seu email" + "Reenviar email" button
  - **Resend button** → POST `/api/auth/resend-verification` (requires auth cookie)
    - Success → toast "Email reenviado!" (sonner)
    - Cooldown: disable button for 60s after click

**Components:** `verify-email-view.tsx` (new)

**API:**
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`

---

### F2.5a — Forgot password page

**What:**
- Create `app/(auth)/forgot-password/page.tsx`
- Create `ForgotPasswordForm` (`components/features/auth/forgot-password-form.tsx`)
  - Single field: email
  - POST `/api/auth/forgot-password`
  - Always show success state after submit (API never reveals if email exists): "Se este email estiver cadastrado, você receberá um link em breve."
  - Back link → `/login`

**Components:** `forgot-password-form.tsx` (new)

**API:** `POST /api/auth/forgot-password`

---

### F2.5b — Reset password page

**What:**
- Create `app/(auth)/reset-password/page.tsx`
- Create `ResetPasswordForm` (`components/features/auth/reset-password-form.tsx`)
  - Reads `?token=` from URL (passed via prop from page)
  - Fields: newPassword + confirmPassword
  - POST `/api/auth/reset-password` with `{ token, newPassword }`
  - On success → "Senha alterada!" → redirect to `/login` after 2s
  - On 400 (`INVALID_OR_EXPIRED_TOKEN`) → "Link inválido ou expirado." + link to `/forgot-password`

**Components:** `reset-password-form.tsx` (new)

**API:** `POST /api/auth/reset-password`

---

## Shared pattern — `AuthField` + `authInputCls`

Both `login-form.tsx` and `register-form.tsx` already define identical `AuthField` + `authInputCls` locals. Before F2.2, extract these to a shared file:

```
components/features/auth/auth-field.tsx   ← AuthField component + authInputCls constant
```

All auth forms import from there. No duplication.

---

## Execution Order

```
F2.1 → Login refinements (smallest, unblocks forgot-password link)
shared → extract AuthField + authInputCls
F2.2 → Register guardian
F2.3 → Register org refactor (2-step)
F2.4 → Verify email
F2.5a → Forgot password
F2.5b → Reset password
```

Each step ends with a QA gate before proceeding to the next.

---

## API Summary

| Step | Endpoint | Method |
|---|---|---|
| F2.1 | `/api/auth/login` | POST (already wired) |
| F2.2 | `/api/auth/register` | POST |
| F2.3 | `/api/auth/register` + `/api/workspaces` | POST + POST |
| F2.4 | `/api/auth/verify-email` + `/api/auth/resend-verification` | POST + POST |
| F2.5a | `/api/auth/forgot-password` | POST |
| F2.5b | `/api/auth/reset-password` | POST |
