# CLAUDE.md

This file is loaded automatically at the start of every conversation.

---

## Project Overview

**BeTheHero** — Responsible pet adoption platform connecting guardians, partner organizations (ONGs, clinics, petshops), and admins.

- **Mission**: Trusted, curated hub for pet adoption with responsibility and transparency
- **Initial scope**: Paraíba (PB), Brazil — pilot cities: João Pessoa, Campina Grande, Bayeux, Santa Rita
- **Language**: Portuguese-first (UI, comments, error messages)
- **Package manager**: pnpm (v9.14.4) — **always use `pnpm`**, never `npm` or `yarn`
- **Main app**: `apps/web/`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.9 (strict) |
| Database | PostgreSQL + Prisma 7 (`@prisma/adapter-pg`) |
| Auth | JWT (`jsonwebtoken`) + bcryptjs, httpOnly cookie `bth_access` |
| RBAC | CASL via `@bethehero/auth` package |
| Validation | Zod 4 |
| Forms | React Hook Form 7 + `@hookform/resolvers` (zodResolver) |
| Data fetching | `@tanstack/react-query` 5 |
| State | Zustand 5 (client/UI state only) |
| UI | shadcn/ui (Radix primitives) + TailwindCSS 4 |
| Styling utils | `class-variance-authority` (CVA) + `clsx` + `tailwind-merge` |
| Toasts | `sonner` |
| HTTP | Native `fetch` — **no Axios** |
| Error boundaries | React 19 built-in (`error.tsx`) — **`react-error-boundary` is NOT installed** |
| Routing | Next.js App Router — **no TanStack Router / React Router** |

---

## Monorepo Structure

```
apps/web/src/
  app/api/           # API routes (thin layer)
  server/
    repositories/    # Data access (Prisma) — interface + factory fn
    use-cases/       # Business logic — return discriminated unions
    schemas/         # Zod validation schemas
  lib/               # Utilities (auth, db, swagger, cookies)
  components/        # UI components
packages/
  auth/              # CASL RBAC definitions (@bethehero/auth)
  env/               # Env validation (@bethehero/env)
docs/                # Documentation and task tracking
```

---

## API Architecture

**Flow**: `Route → parse/validate (Zod) → UseCase(repos, principal, input) → Repository (Prisma) → Response`

### Routes (`app/api/`) — thin layer
1. `getPrincipal(req)` — extract auth context (returns null if unauthenticated)
2. `SomeSchema.safeParse(body)` — validate with Zod
3. Call use case
4. Map error codes → HTTP status and return `NextResponse.json(...)`

### Use cases (`server/use-cases/`) — business logic
- Receive repos as parameters (no direct Prisma access)
- Return discriminated unions: `{ success: true; data: T } | { success: false; code: string }`

### Repositories (`server/repositories/`) — data access
- Encapsulate Prisma; export interface + factory function
- No business logic here

### Error code → HTTP
- `UNAUTHENTICATED` → 401, `FORBIDDEN` → 403, `NOT_FOUND` → 404, conflicts → 409

### Zod rules
- `z.email()` — NOT `z.string().email()`
- `z.uuid()` — NOT `z.string().uuid()`
- Validation error response: `{ message: 'Invalid payload', details: parsed.error.issues }`

---

## Frontend Coding Standards

### Components & Styling
- **CVA** for variants: `cva('base', { variants: { ... } })`
- `cn()` utility (clsx + tailwind-merge) for className composition and Tailwind conflict resolution
- Extend `React.HTMLAttributes` or `ComponentPropsWithoutRef` — allow `className` override from parent
- **Compound components** with Context only when sub-components share data
- Split entity-specific UIs into dedicated components; `BaseX` only when truly shared
- No boolean props like `isOnProfile` — use composition or separate components

### Architecture
- **Single responsibility** per component/function
- **One abstraction level** per function — don't mix low-level and high-level logic
- **Composition over props** — pass server components as `children` to client wrappers
- Feature-based folder organization for large areas; shared code in `shared/`

### State
- **React Query** → server/async state (never duplicate in Zustand)
- **Zustand** → client/UI state (filters, toggles, modals)
- **Derive** values during render with `useMemo` instead of `useState + useEffect`
- `useRef` for values that don't affect UI (timers, mutable refs)
- URL state for shareable filters (`useSearchParams`)

### Forms
- `useForm` with `resolver: zodResolver(schema)` and explicit `defaultValues` per field
- `formState.isSubmitting` for loading/disabling; `formState.errors` for messages
- `Controller` / `useController` for custom inputs (date pickers, selects)
- `setError('root', { message })` for API-level form errors
- `onSuccess` callback prop for post-submit actions (redirect, refetch)
- Create vs Edit: pass optional entity prop; check presence to decide POST vs PATCH

### Data Fetching (Next.js App Router)
- **Server components**: `await fetch(...)` directly — no useEffect, no loading state needed
- **Client with refetch/infinite**: React Query `useQuery` / `useInfiniteQuery`
- **RSC → client hydration**: `queryClient.prefetchQuery` + `HydrationBoundary`
- No TanStack Router / React Router loaders — this is Next.js App Router

### Custom Hooks
- Prefix with `use` (e.g., `useFetchUser`, `useAddComment`)
- Wrap returned functions in `useCallback`
- Never return JSX; never call hooks conditionally or in loops
- Cross-hook: `useAddComment({ onSuccess: refetch })` pattern

### useEffect
- Use sparingly — only for subscriptions, DOM mutations, timers
- Never disable `eslint-disable exhaustive-deps`
- Stabilize non-primitive deps with `useMemo` / `useCallback`
- Don't chain useEffects; consolidate into a single event handler

### Error Handling
- **Expected errors** (validation, 404, API): return/display in UI — do not throw
- **Unexpected errors**: `error.tsx` files in Next.js App Router segments (React 19 built-in)
- Do not store tokens in localStorage or JS-accessible cookies

### TypeScript
- Infer types from Zod: `z.infer<typeof Schema>` — no manual duplication
- Composable types: `PostForList = Post & PostWithCommentsCount` — depend on shape, not origin
- Utility return pattern: `[data, null] | [null, error]` for flexible error handling in callers

---

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Prisma generate + Next.js build
pnpm lint             # tsc --noEmit + ESLint (max-warnings: 0)
pnpm lint-fix         # Auto-fix lint
pnpm prettier-format  # Format code
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run migrations (dev)
pnpm db:push          # Push schema without migration (dev)
pnpm db:studio        # Prisma Studio UI
```

Validation before marking execution complete:
```bash
pnpm lint    # Must pass (0 warnings)
pnpm build   # Must succeed
```

---

## Development Workflow

Full instructions: [docs/CLAUDE-INSTRUCTIONS.md](docs/CLAUDE-INSTRUCTIONS.md)

```
Phase 0: PM/PO mode  → Clarify, generate task brief
Phase 1: EXPLORATION → Read-only, document findings
Phase 2: RESEARCH    → Analysis only
Phase 3: PLANNING    → Break into sub-steps → WAIT: "Approve? (y/n)"
Phase 4: EXECUTION   → Implement one sub-step at a time, QA after each
```

**Never skip phases. Never write code before PLANNING is approved. Never run git commands.**

Task docs live in `docs/tasks/<feature-slug>/`:
- `brief.md`, `exploration.md`, `research.md`, `plan.md`, `todo.md`, `validation.md`

Phase transitions:
```
EXPLORATION done → "Exploration complete. Move to Research? (y/n)"
RESEARCH done    → "Research complete. Move to Planning? (y/n)"
PLANNING done    → "Plan ready. Approve? (y/n)"  ← wait for y
Each sub-step    → QA checklist output            ← wait for ok
All steps done   → "✅ Implementation complete. Ready for your review."
```

---

## Naming Conventions

- Files: `kebab-case` (e.g., `register-user.use-case.ts`)
- Functions/variables: `camelCase`
- Types/Interfaces/Classes/Enums: `PascalCase`
- Enum values: `UPPER_SNAKE_CASE`
- Hooks: prefix `use`
- Be explicit: `createProjectFormSchema`, not `formSchema`

---

## Reference

- [docs/CLAUDE-INSTRUCTIONS.md](docs/CLAUDE-INSTRUCTIONS.md) — Full AI workflow
- [docs/README.md](docs/README.md) — Human guide
- [docs/_templates/](docs/_templates/) — Templates
- [apps/web/src/app/api/](apps/web/src/app/api/) — API routes
- [apps/web/src/server/](apps/web/src/server/) — Repositories, use-cases, schemas
- [packages/auth/](packages/auth/) — RBAC definitions
