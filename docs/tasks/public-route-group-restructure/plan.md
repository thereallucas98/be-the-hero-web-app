# Plan — Public Route Group Restructure

## Ordered sub-steps

### Step 1 — Create `(marketing)` layout
**File**: `apps/web/src/app/(public)/(marketing)/layout.tsx` *(new)*

Content: move `SiteHeader` + `SiteFooter` shell from current `(public)/layout.tsx`.
`default` export only — drop the named `PublicLayout` export.

---

### Step 2 — Move marketing pages into `(marketing)/`
Move (content unchanged, just location):

| From | To |
|---|---|
| `(public)/page.tsx` | `(public)/(marketing)/page.tsx` |
| `(public)/pets/page.tsx` | `(public)/(marketing)/pets/page.tsx` |
| `(public)/campaigns/page.tsx` | `(public)/(marketing)/campaigns/page.tsx` |
| `(public)/sobre-bethehero/page.tsx` | `(public)/(marketing)/sobre-bethehero/page.tsx` |

---

### Step 3 — Create `(detail)` layout
**File**: `apps/web/src/app/(public)/(detail)/layout.tsx` *(new)*

Content: bare layout — `<>{children}</>` — explicitly documents that detail pages have no nav shell.

---

### Step 4 — Move detail pages into `(detail)/`
Move (content unchanged):

| From | To |
|---|---|
| `(public)/pets/[id]/page.tsx` | `(public)/(detail)/pets/[id]/page.tsx` |
| `(public)/workspaces/[id]/page.tsx` | `(public)/(detail)/workspaces/[id]/page.tsx` |

---

### Step 5 — Delete old files
- Delete `(public)/layout.tsx`
- Delete now-empty directories: `(public)/pets/`, `(public)/workspaces/`, `(public)/campaigns/`, `(public)/sobre-bethehero/`

---

### Step 6 — Lint + build validation
```bash
pnpm lint   # 0 warnings
pnpm build  # all routes present, no missing segments
```

Verify in build output:
- `○ /` — static
- `ƒ /pets` — dynamic
- `ƒ /pets/[id]` — dynamic
- `ƒ /workspaces/[id]` — dynamic
- `○ /campaigns` — static
- `○ /sobre-bethehero` — static

## Files changed

| Action | Path |
|---|---|
| Create | `(public)/(marketing)/layout.tsx` |
| Move | `(public)/page.tsx` → `(public)/(marketing)/page.tsx` |
| Move | `(public)/pets/page.tsx` → `(public)/(marketing)/pets/page.tsx` |
| Move | `(public)/campaigns/page.tsx` → `(public)/(marketing)/campaigns/page.tsx` |
| Move | `(public)/sobre-bethehero/page.tsx` → `(public)/(marketing)/sobre-bethehero/page.tsx` |
| Create | `(public)/(detail)/layout.tsx` |
| Move | `(public)/pets/[id]/page.tsx` → `(public)/(detail)/pets/[id]/page.tsx` |
| Move | `(public)/workspaces/[id]/page.tsx` → `(public)/(detail)/workspaces/[id]/page.tsx` |
| Delete | `(public)/layout.tsx` |
