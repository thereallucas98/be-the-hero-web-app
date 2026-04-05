# Plan — F3: Guardian Portal

## Sub-steps

### Step 1 — Middleware: guardian route protection

Update `middleware.ts` to protect `/guardian/*` routes:
1. Read `bth_access` cookie
2. Verify JWT (decode only, no Prisma)
3. If no token → redirect to `/login?redirectTo={pathname}`
4. If role ≠ `GUARDIAN` → redirect to `/`

**Files modified:**
- `apps/web/src/middleware.ts`

---

### Step 2 — F3.1: Guardian layout + GuardianSidebar + mobile bottom nav

Create the `(guardian)` route group with:
- `layout.tsx` — sidebar + main content (mirrors workspace layout)
- `GuardianSidebar` — client component, `usePathname` active state, 3 nav items (Heart=Interesses, Home=Adoções, User=Perfil), back button
- Mobile bottom nav — `lg:hidden` bar at bottom, sidebar `hidden lg:flex`

**Files created:**
- `apps/web/src/app/(guardian)/layout.tsx`
- `apps/web/src/app/(guardian)/guardian/layout.tsx` (nested — adds the `/guardian` prefix)
- `apps/web/src/components/features/guardian/guardian-sidebar.tsx`
- `apps/web/src/components/features/guardian/guardian-bottom-nav.tsx`

---

### Step 3 — F3.2: My interests page

Client component with React Query + GraphQL:
- `useQuery` → `myInterests` GraphQL query
- Interest card: pet thumbnail, pet name, species, size, age badge, channel badge, date
- Withdraw button → `useMutation` → `withdrawInterest` GraphQL mutation
- Optimistic removal from cache + invalidate on settle
- Empty state when no interests
- Pagination

**Files created:**
- `apps/web/src/app/(guardian)/guardian/interests/page.tsx`
- `apps/web/src/components/features/guardian/interest-card.tsx`

---

### Step 4 — F3.3: My adoptions page

Client component with React Query + GraphQL:
- `useQuery` → `myAdoptions` GraphQL query
- Adoption card: pet thumbnail, pet name, species, adoption date, status badge
- Follow-up progress indicator (count of completed/total)
- Link to adoption detail
- Empty state, pagination

**Files created:**
- `apps/web/src/app/(guardian)/guardian/adoptions/page.tsx`
- `apps/web/src/components/features/guardian/adoption-card.tsx`

---

### Step 5 — F3.4: Adoption detail + follow-up timeline

Client component with React Query + GraphQL:
- `useQuery` → `adoption(id)` GraphQL query
- Adoption summary: pet info, workspace name, adopted date, status
- Follow-up timeline: list of follow-ups with type label, scheduled date, status badge
- Current submission status shown when present
- Back link to adoptions list

**Files created:**
- `apps/web/src/app/(guardian)/guardian/adoptions/[id]/page.tsx`
- `apps/web/src/components/features/guardian/follow-up-timeline.tsx`

---

### Step 6 — F3.5: Profile settings

Client component with React Hook Form + React Query + GraphQL:
- `useQuery` → `me` GraphQL query (pre-fill form)
- Profile form: fullName, phone → `useMutation` → `updateMe`
- Password form: currentPassword, newPassword, confirmNewPassword → `useMutation` → `changePassword`
- Two separate forms, each with its own submit
- Success/error toasts

**Files created:**
- `apps/web/src/app/(guardian)/guardian/profile/page.tsx`
- `apps/web/src/components/features/guardian/profile-form.tsx`
- `apps/web/src/components/features/guardian/change-password-form.tsx`

---

### Step 7 — GraphQL hooks (React Query + graphql-request)

Create reusable hooks that wrap `useQuery`/`useMutation` with `graphql-request`:
- `useMe` — `me` query
- `useMyInterests` — `myInterests` query with pagination
- `useMyAdoptions` — `myAdoptions` query with pagination
- `useAdoption` — `adoption(id)` query
- `useWithdrawInterest` — `withdrawInterest` mutation
- `useUpdateMe` — `updateMe` mutation
- `useChangePassword` — `changePassword` mutation

These hooks live alongside the operations and are imported by pages/components.

**Files created:**
- `apps/web/src/graphql/hooks/use-me.ts`
- `apps/web/src/graphql/hooks/use-my-interests.ts`
- `apps/web/src/graphql/hooks/use-my-adoptions.ts`
- `apps/web/src/graphql/hooks/use-adoption.ts`
- `apps/web/src/graphql/hooks/use-withdraw-interest.ts`
- `apps/web/src/graphql/hooks/use-update-me.ts`
- `apps/web/src/graphql/hooks/use-change-password.ts`

> **Note:** Step 7 is listed last but will be built first (before Steps 3–6) since pages depend on these hooks.

---

### Step 8 — QA: curl + browser checklist

**Curl tests:**
- Unauthenticated → redirect to login
- Non-guardian role → redirect to /
- All pages load for guardian user

**Browser QA checklist** (user performs):
- Navigate to `/guardian/interests` — see interest list
- Withdraw an interest — confirm removal + toast
- Navigate to `/guardian/adoptions` — see adoption list
- Click adoption → detail page with follow-up timeline
- Navigate to `/guardian/profile` — edit name, change password
- Mobile: bottom nav visible, sidebar hidden
- Desktop: sidebar visible, bottom nav hidden

---

### Step 9 — Lint + Build validation

```bash
pnpm lint
pnpm build
```

---

## Execution order

The actual build sequence differs from the step numbering for dependency reasons:

1. **Step 1** — Middleware
2. **Step 7** — GraphQL hooks (pages depend on these)
3. **Step 2** — Layout + sidebar + bottom nav
4. **Step 3** — Interests page
5. **Step 4** — Adoptions page
6. **Step 5** — Adoption detail
7. **Step 6** — Profile settings
8. **Step 8** — QA
9. **Step 9** — Lint + build

---

## Shared components / labels

PT-BR label maps needed across pages:

```ts
// Species
DOG → Cachorro, CAT → Gato, BIRD → Pássaro, RABBIT → Coelho, OTHER → Outro

// Adoption status
ACTIVE → Ativa, COMPLETED → Concluída, CANCELLED → Cancelada

// Follow-up type
DAYS_30 → 30 dias, MONTHS_6 → 6 meses, YEAR_1 → 1 ano

// Follow-up status
PENDING → Pendente, SUBMITTED → Enviado, APPROVED → Aprovado, REJECTED → Rejeitado

// Interest channel
WHATSAPP → WhatsApp, PHONE → Telefone, IN_PERSON → Presencial
```

These will be defined in a shared `guardian-labels.ts` utility.

---

## Test strategy

- **Functional:** GraphQL queries return correct data for guardian user
- **Auth:** middleware redirects unauthenticated and non-guardian users
- **Mutations:** withdraw interest optimistic update, profile update, password change
- **Responsive:** mobile bottom nav vs desktop sidebar
- **Browser QA:** full checklist for user to verify
