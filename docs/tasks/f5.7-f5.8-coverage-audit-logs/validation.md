# Validation — F5.7 + F5.8

## Build validation

| Check | Status |
|---|---|
| `pnpm lint` passes | ✅ |
| `pnpm build` succeeds | ✅ |
| `/admin/coverage` + `/admin/audit-logs` in build | ✅ |

## Browser QA Checklist

**Login:** `superadmin@bth.dev` / `Pass1234!` (SUPER_ADMIN required for both)

### F5.7 Coverage (`/admin/coverage`)
- [ ] Current cities listed (or empty state)
- [ ] State select → loads cities
- [ ] Select city → "Adicionar" → toast, city appears in list
- [ ] Trash icon on city → confirmation dialog → "Remover" → toast, city removed
- [ ] Duplicate city → error toast

### F5.8 Audit Logs (`/admin/audit-logs`)
- [ ] Table loads with logs (date, actor, action, entity type, entity ID)
- [ ] Entity type filter works (dropdown)
- [ ] Action filter works (dropdown)
- [ ] Date range filter works
- [ ] "Limpar" resets all filters
- [ ] Pagination when > 20 logs
- [ ] Empty state when no logs match filters
