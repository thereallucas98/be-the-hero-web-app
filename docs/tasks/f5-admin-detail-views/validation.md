# Validation — Admin Detail Views

## Build validation

| Check | Status |
|---|---|
| `pnpm lint` passes | ✅ |

## Browser QA Checklist

**Login:** `admin@bth.dev` or `superadmin@bth.dev` / `Pass1234!`

### Pet detail (`/admin/pets/[id]`)
- [ ] Click pet name in queue → navigates to detail page
- [ ] Shows: name, species, sex, size, age, workspace name
- [ ] Cover image or fallback icon
- [ ] Description, attributes (energy, independence, environment)
- [ ] Images grid
- [ ] Requirements list with mandatory badges
- [ ] Approve/reject buttons with correct styling
- [ ] "Voltar" link back to queue

### Workspace detail (`/admin/workspaces/[id]`)
- [ ] Click workspace name → detail page
- [ ] Shows: name, type badge, verification status
- [ ] CNPJ, email, phone, website, Instagram (if present)
- [ ] Description, location
- [ ] Members list with roles
- [ ] Review note shown if rejected
- [ ] Approve/reject buttons for PENDING status

### Campaign detail (`/admin/campaigns/[id]`)
- [ ] Click campaign title → detail page
- [ ] Shows: title, status, workspace, pet (if any)
- [ ] Description, progress bar with amounts
- [ ] Dates (created, start, end)
- [ ] Documents list
- [ ] Review note if rejected
- [ ] Approve/reject buttons for PENDING_REVIEW

### Donations (expandable)
- [ ] Click donation row → expands to show payment method, date, proof link, review note
- [ ] Click again → collapses
- [ ] Proof link opens in new tab

### Follow-ups (expandable)
- [ ] Click submission row → expands to show scheduled date, message, photo link
- [ ] Click again → collapses
