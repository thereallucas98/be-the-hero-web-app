# Plan — F4.5: Workspace Adoption Interests

## Sub-steps

### Step 1 — WorkspaceInterestCard component

Card showing: guardian name + email, pet name + species badge, message (if any), date.
Action buttons: "Converter em adoção" (primary), "Dispensar" (ghost/destructive).

**File:** `components/features/workspaces/workspace-interest-card.tsx`

### Step 2 — Convert dialog component

Dialog with:
- Summary text (guardian name → pet name)
- Optional notes textarea
- "Confirmar adoção" + "Cancelar" buttons

**File:** `components/features/workspaces/convert-interest-dialog.tsx`

### Step 3 — Interests page

Client component at `app/(workspace)/workspaces/[id]/interests/page.tsx`:
- `useQuery` → `GET /api/workspaces/${workspaceId}/interests`
- Dismiss ��� `useMutation` → DELETE, optimistic removal + invalidate
- Convert → `useMutation` → POST, invalidate on success
- Empty state, loading skeleton, pagination

### Step 4 — Lint + build

### Step 5 — Browser QA checklist

## Execution order

1 → 2 → 3 → 4 → 5
