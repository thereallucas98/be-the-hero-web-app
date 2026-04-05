# Plan — F4.6: Workspace Campaign Management

## Sub-steps

### Step 1 — Campaign form dialog (create + edit)

Shared dialog component with React Hook Form + Zod:
- title (required), description (required), goalAmount (required, number)
- Mode: create (POST) or edit (PATCH, pre-filled)

**File:** `components/features/workspaces/campaign-form-dialog.tsx`

### Step 2 — Workspace campaign card

Card for the list: title, status badge, goal/current amounts, progress bar, dates.

**File:** `components/features/workspaces/workspace-campaign-card.tsx`

### Step 3 — Campaign list page

Client component with React Query:
- Status filter tabs
- Campaign cards grid/list
- "Nova campanha" button → opens create dialog
- Pagination

**File:** `app/(workspace)/workspaces/[id]/campaigns/page.tsx`

### Step 4 — Campaign detail page

Client component with React Query:
- Campaign info section
- Edit button (DRAFT only) → edit dialog
- Submit for review button (DRAFT + docs exist)
- Donations list (paginated)
- Back link

**File:** `app/(workspace)/workspaces/[id]/campaigns/[campaignId]/page.tsx`

### Step 5 — Sidebar update

Add "Campanhas" nav item to workspace sidebar (Megaphone icon).

### Step 6 — Lint + build + browser QA checklist

## Execution order

1 → 2 → 3 → 4 → 5 → 6
