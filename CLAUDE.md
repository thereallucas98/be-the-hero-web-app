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
| UI | **shadcn/ui** (Radix UI primitives, New York style) + TailwindCSS 4 |
| Styling utils | `class-variance-authority` (`cva`) + `cn()` from `~/lib/utils` |
| Icons | `lucide-react` or `phosphor-icons` |
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
  components/
    ui/              # Primitive/shared components (Button, Card, Input…)
    features/        # Feature-specific components (pets/, workspaces/, admin/…)
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

**Variants with `cva()` from `class-variance-authority`:**
```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '~/lib/utils'
import * as React from 'react'

export const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'rounded-button bg-primary text-primary-foreground shadow hover:bg-primary-hover',
        secondary: 'rounded-button border border-accent-navy bg-white text-accent-navy hover:bg-brand-primary-pale',
        ghost: 'rounded-button text-accent-navy hover:bg-brand-primary-pale hover:text-accent-navy',
        destructive: 'rounded-button bg-destructive text-destructive-foreground shadow-sm hover:opacity-90',
        outline: 'rounded-button border border-input bg-background shadow-sm hover:bg-muted',
        link: 'text-accent-navy underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm [&_svg]:size-4',
        sm: 'h-8 px-3 text-xs [&_svg]:size-3.5',
        lg: 'h-12 px-6 text-base [&_svg]:size-5',
        icon: 'h-10 w-10 [&_svg]:size-4',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
)
Button.displayName = 'Button'
```

**Compound components (no Context unless sub-components share data):**
```tsx
import * as React from 'react'
import { cn } from '~/lib/utils'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-xl border bg-card text-card-foreground shadow', className)} {...props} />
  ),
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  ),
)
CardHeader.displayName = 'CardHeader'
```

**Rules:**
- **Always `cn()`** from `~/lib/utils` for className merging — never raw `twMerge()` or `clsx()`
- **Always `cva()`** for variants — never `tv()` from tailwind-variants
- **`React.forwardRef` + `displayName`** for all UI primitives
- **`focus-visible`** on every interactive element: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- **`aria-label`** on every icon-only button: `<button aria-label="Fechar"><X /></button>`
- **`{...props}` always last** in JSX spread
- **`[&_svg]:size-3.5`** in variants for icon sizing, `<Icon className="size-4" />` inline
- **Colors via CSS variables only** — never hardcoded hex/rgb: use `bg-background`, `text-foreground`, `border-border`, etc.

**CSS variable palette:**
```
bg-surface, bg-surface-raised         → backgrounds
bg-primary, bg-secondary, bg-muted    → actions/states
bg-destructive                        → errors/danger
text-foreground                       → primary text
text-foreground-subtle                → secondary text
text-muted-foreground                 → disabled text
text-primary-foreground               → text on primary bg
border-border, border-input           → default borders
border-primary, border-destructive    → accent borders
ring-ring                             → focus ring
```

**shadcn/ui component usage (Radix UI primitives):**
```tsx
// Dialog — from ~/components/ui/dialog
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
<Dialog><DialogTrigger /><DialogContent><DialogHeader><DialogTitle /></DialogHeader></DialogContent></Dialog>

// Tabs — from ~/components/ui/tabs
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'
<Tabs><TabsList><TabsTrigger value="x" /></TabsList><TabsContent value="x" /></Tabs>

// Select — from ~/components/ui/select
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '~/components/ui/select'
<Select><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="x" /></SelectContent></Select>

// DropdownMenu — from ~/components/ui/dropdown-menu
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '~/components/ui/dropdown-menu'
<DropdownMenu><DropdownMenuTrigger /><DropdownMenuContent><DropdownMenuItem /></DropdownMenuContent></DropdownMenu>
```

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
- **`import type`** for all type-only imports: `import type { ComponentProps } from 'react'`
- **Never `React.FC`**, never `any`
- **No `forwardRef`** — React 19 supports ref as a prop directly
- Extend `ComponentProps<'element'>` + `VariantProps<typeof variants>` for component props
- Infer types from Zod: `z.infer<typeof Schema>` — no manual duplication
- Composable types: `PostForList = Post & PostWithCommentsCount` — depend on shape, not origin

### Component checklist (required for every new component)
- [ ] File: lowercase with hyphens (`user-card.tsx`)
- [ ] **Named export** — never default export
- [ ] `ComponentProps<'element'>` + `VariantProps` for props interface
- [ ] Variants with `cva()`, class merge with `cn()`
- [ ] `data-slot="name"` on root element
- [ ] States via `data-[state]:` attributes
- [ ] CSS variable colors only — no hardcoded values
- [ ] `focus-visible` on all interactive elements
- [ ] `aria-label` on icon-only buttons
- [ ] `{...props}` spread last

---

## Commands

```bash
pnpm dev              # Start dev server (may use :3001 if :3000 is taken)
pnpm build            # Prisma generate + Next.js build
pnpm lint             # tsc --noEmit + ESLint (max-warnings: 0)
pnpm lint-fix         # Auto-fix lint
pnpm prettier-format  # Format code
pnpm db:generate      # Generate Prisma client
cd apps/web && pnpm db:migrate   # Run migrations (must cd into apps/web first)
pnpm db:push          # Push schema without migration (dev)
pnpm db:studio        # Prisma Studio UI
```

Validation before marking execution complete:
```bash
pnpm lint    # Must pass (0 warnings)
pnpm build   # Must succeed
```

---

## Dev Environment

- **Database**: PostgreSQL via Docker — `docker compose up -d` (from repo root)
- **Container name**: `bethehero-postgres` | **DB name**: `pronai` | **User**: `postgres` | **Password**: `docker`
- **Swagger UI**: `http://localhost:3001/api-docs` (all API docs live here)
- **DB direct access**: `docker exec bethehero-postgres psql -U postgres -d pronai -c "..."`
- **Cookie jar for tests**: `/tmp/bth_cookies.txt`

### API Testing (QA gates — Claude runs these, not the user)

At each QA gate, Claude must:
1. Ensure Docker + dev server are running
2. Execute curl tests covering: happy path, 401, 403, 404, 400, business rule violation
3. Verify DB side effects where applicable (e.g., `SELECT` after insert)
4. Show a result table (✅/❌ per test case)
5. Fix any failures before reporting the gate as passed

```bash
BASE="http://localhost:3001"
COOKIE_JAR="/tmp/bth_cookies.txt"

# Login (save cookie for subsequent requests)
curl -s -c $COOKIE_JAR -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@bth.dev","password":"Pass1234!"}'

# Authenticated request
curl -s -b $COOKIE_JAR -X POST $BASE/api/... \
  -H "Content-Type: application/json" \
  -d '{"field":"value"}' | python3 -m json.tool

# Status code only
curl -s -o /dev/null -w "HTTP %{http_code}\n" -b $COOKIE_JAR -X DELETE $BASE/api/...
```

### Swagger docs (required for every new endpoint)

Add JSDoc comments to `apps/web/src/lib/swagger/definitions/<domain>.ts`. Verify at `/api-docs`.

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
Each sub-step    → Claude runs curl tests + shows results table ← wait for ok
All steps done   → "✅ Implementation complete. Ready for your review."
                   + suggested commit message (one line, imperative, 72 chars max)
```

---

## Naming Conventions

- Files: `kebab-case` (e.g., `register-user.use-case.ts`, `user-card.tsx`)
- Functions/variables: `camelCase`
- Types/Interfaces/Classes/Enums: `PascalCase`
- Enum values: `UPPER_SNAKE_CASE`
- Hooks: prefix `use`
- Be explicit: `createProjectFormSchema`, not `formSchema`
- **Always named exports** — never `export default`
- **No barrel files** (`index.ts`) for internal component/feature folders

---

## Reference

- [docs/CLAUDE-INSTRUCTIONS.md](docs/CLAUDE-INSTRUCTIONS.md) — Full AI workflow
- [docs/README.md](docs/README.md) — Human guide
- [docs/_templates/](docs/_templates/) — Templates
- [apps/web/src/app/api/](apps/web/src/app/api/) — API routes
- [apps/web/src/server/](apps/web/src/server/) — Repositories, use-cases, schemas
- [packages/auth/](packages/auth/) — RBAC definitions
