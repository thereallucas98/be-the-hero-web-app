# Todo — F1.5: Public Workspace Profile

## Step 1 — workspace-profile-header.tsx
- [ ] Create `components/features/workspaces/workspace-profile-header.tsx`
- [ ] Props: `name`, `type`, `location: string | null`, `description`
- [ ] Type badge with PT-BR label map
- [ ] Location chip with MapPin icon (conditional)
- [ ] Name as `<h1>`, description as `<p>`

## Step 2 — workspace-profile-contact.tsx
- [ ] Create `components/features/workspaces/workspace-profile-contact.tsx`
- [ ] `buildWhatsAppUrl` helper
- [ ] WhatsApp link (conditional)
- [ ] Phone badge (conditional)
- [ ] Email mailto link (conditional)
- [ ] Website external link (conditional)
- [ ] Instagram link (conditional)
- [ ] Fallback "Nenhum contato disponível" when all null

## Step 3 — workspace-pets-preview.tsx
- [ ] Create `components/features/workspaces/workspace-pets-preview.tsx`
- [ ] Transform `coverImage: string | null` → `{ url } | null` for PetCard
- [ ] Responsive grid of PetCards
- [ ] "Ver todos os pets" link with workspaceId filter
- [ ] Returns null when 0 pets

## Step 4 — workspace-campaigns-preview.tsx
- [ ] Create `components/features/workspaces/workspace-campaigns-preview.tsx`
- [ ] Import `Progress` from `~/components/ui/progress`
- [ ] Campaign card: cover image or placeholder, title, progress bar, amounts label, deadline
- [ ] Progress value capped at 100
- [ ] Returns null when 0 campaigns

## Step 5 — app/(public)/workspaces/[id]/page.tsx
- [ ] Replace stub with full server component
- [ ] Call `getPublicWorkspace` + `notFound()` on failure
- [ ] Sidebar + mobile back-button layout shell
- [ ] Compose all 4 section components inside white card
- [ ] Conditional separators between sections

## Step 6 — Validation
- [ ] `pnpm lint` passes (0 warnings)
- [ ] `pnpm build` succeeds
- [ ] Manual QA: all sections render, empty sections hidden, 404 on bad id
