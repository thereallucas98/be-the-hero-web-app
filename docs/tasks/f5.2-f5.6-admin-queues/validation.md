# Validation — F5.2–F5.6: Admin Approval Queues

## Build validation

| Check | Status |
|---|---|
| `pnpm lint` passes (0 warnings) | ✅ |
| `pnpm build` succeeds | ✅ |
| All 5 queue routes in build output | ✅ |

## Browser QA Checklist

**Login:** `admin@bth.dev` / `Pass1234!`

### F5.2 Pets (`/admin/pets`)
- [ ] Status tabs: Em revisão, Aprovados, Rejeitados
- [ ] Pet cards show name, species, workspace name
- [ ] Approve button → toast "Pet aprovado", item removed from pending
- [ ] Reject button → dialog with reviewNote → toast "Pet rejeitado"
- [ ] Empty state when no pets in selected status

### F5.3 Workspaces (`/admin/workspaces`)
- [ ] Status tabs: Pendentes, Aprovados, Rejeitados
- [ ] Cards show name, type (ONG/Clínica/Petshop), date
- [ ] Review note shown for rejected workspaces
- [ ] Approve/reject actions work

### F5.4 Campaigns (`/admin/campaigns`)
- [ ] Status tabs: Em revisão, Aprovadas, Rejeitadas
- [ ] Cards show title, description, goal amount (BRL)
- [ ] Approve/reject actions work

### F5.5 Donations (`/admin/donations`)
- [ ] Status tabs: Pendentes, Aprovadas, Rejeitadas
- [ ] Cards show donor name, email, amount (BRL)
- [ ] Approve/reject actions work

### F5.6 Follow-ups (`/admin/follow-ups`)
- [ ] Status tabs: Enviados, Aprovados, Rejeitados
- [ ] Cards show pet name, guardian name, follow-up type, workspace, submission date
- [ ] Approve/reject actions work

### Shared behavior (all queues)
- [ ] Reject dialog opens with textarea for review note
- [ ] Reject disabled when note is empty
- [ ] Pagination works when > 20 items
- [ ] Loading skeleton while fetching
