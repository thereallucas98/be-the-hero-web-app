# Research — F1.5: Public Workspace Profile

## Decision 1 — Page structure (single file vs extracted components)

**Options:**
- A) Everything inlined in `page.tsx`
- B) Extract all three sections to feature components under `components/features/workspaces/`

**Decision: B — extract all sections**

Design for scale, not just the current page. Each section (pets preview, campaigns preview, contact) may be reused across future workspace-related pages (F4.2 dashboard, guardian workspace view, etc.). Extracted components are also easier to test and maintain independently.

Components to create:
- `workspace-profile-header.tsx` — name, type badge, location, description
- `workspace-pets-preview.tsx` — grid of ≤6 PetCards + "Ver todos" link
- `workspace-campaigns-preview.tsx` — ≤3 campaign cards with Progress
- `workspace-profile-contact.tsx` — all contact links (WhatsApp, phone, email, website, Instagram)

---

## Decision 2 — Contact section: extend existing vs new component

**Options:**
- A) Extend `WorkspaceContactCard` (adds email, website, instagram props)
- B) New `workspace-profile-contact.tsx` in `components/features/workspaces/`

**Decision: B — new component**

`WorkspaceContactCard` is used in `pets/[id]/page.tsx` with a specific minimal design (name + address + single phone/WA badge). Adding email/website/instagram to it would bloat its interface and change the visual. A new, standalone component is cleaner and respects single responsibility.

---

## Decision 3 — Campaign progress bar: native HTML vs shadcn Progress

**Options:**
- A) shadcn `Progress` (Radix `@radix-ui/react-progress`)
- B) Raw `div` with inline `width` style

**Decision: A — Radix Progress**

When a Radix/shadcn primitive exists, always use it. `Progress` is already installed at `~/components/ui/progress`. It handles accessibility (aria attributes), animation (`transition-all`), and is consistent with the design system. Raw inline-width divs are never acceptable when a component exists.

---

## Decision 4 — Layout shell: copy vs shared layout component

**Options:**
- A) Copy the sidebar + back-button shell from `pets/[id]/page.tsx`
- B) Extract to a shared `<DetailPageShell>` component first

**Decision: A — copy**

Only two pages use this pattern right now. Extracting a layout component for 2 usages is premature abstraction. Copy the relevant JSX — sidebar, mobile back row, breadcrumb — and customize the breadcrumb text and back href.

---

## Decision 5 — Back button destination

The pet detail links back to `/pets`. This page should link back to `/pets` as well (most users arrive from a pet card or the listing).

---

## Component placement

```
components/features/workspaces/workspace-profile-header.tsx      ← new
components/features/workspaces/workspace-pets-preview.tsx        ← new
components/features/workspaces/workspace-campaigns-preview.tsx   ← new
components/features/workspaces/workspace-profile-contact.tsx     ← new
```

No new `components/ui/` primitives needed — Badge, Separator, LogoIcon, Progress all exist.

---

## Edge cases

- **0 pets** → hide the entire "Animais disponíveis" section (no empty state needed for a public profile)
- **0 campaigns** → hide the entire "Campanhas ativas" section
- **No location** → skip the location chip in the header
- **No description** → `description` is required in schema so should always exist, but render defensively
- **Campaign with no cover image** → show a brand-color placeholder `div` (same pattern as PetCard)
- **Campaign `endsAt`** is a JS `Date` — Next.js server components serialize it as ISO string through props. Since this is all in one server component (no prop passing across server/client boundary), we can call `.toLocaleDateString('pt-BR')` directly.
