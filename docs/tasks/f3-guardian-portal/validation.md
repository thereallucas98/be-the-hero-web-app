# Validation — F3: Guardian Portal

## Build validation

| Check | Status |
|---|---|
| `pnpm lint` passes (0 warnings) | ✅ |
| `pnpm build` succeeds | ✅ |
| Guardian routes in build output | ✅ `/guardian/interests`, `/guardian/adoptions`, `/guardian/adoptions/[id]`, `/guardian/profile` |
| Middleware active on `/guardian/*` | ✅ |

## Browser QA Checklist

### Auth guard (middleware)
- [ ] Visit `/guardian/interests` without logging in → redirected to `/login?redirectTo=/guardian/interests`
- [ ] Login as a non-guardian user (e.g. workspace partner) → visit `/guardian/interests` → redirected to `/`
- [ ] Login as guardian → visit `/guardian/interests` → page loads normally

### Layout & navigation
- [ ] **Desktop (lg+):** Left sidebar visible with logo, 3 nav icons (Interesses, Adoções, Perfil), back button
- [ ] **Desktop:** Active nav item highlighted (white bg on active route)
- [ ] **Desktop:** Back button navigates to `/`
- [ ] **Mobile (<lg):** Sidebar hidden, bottom nav bar visible with 3 icons + labels
- [ ] **Mobile:** Active nav item highlighted in bottom bar
- [ ] **Mobile:** Main content has bottom padding (not hidden behind bottom nav)

### F3.2 — Interesses (`/guardian/interests`)
- [ ] Interest cards load showing pet name, species badge, channel badge, date
- [ ] Pet thumbnail shown (or paw icon fallback if no image)
- [ ] Click X button on interest → card removed instantly (optimistic)
- [ ] Toast appears: "Interesse retirado com sucesso"
- [ ] If no interests: empty state with message "Você ainda não demonstrou interesse em nenhum pet."
- [ ] Pagination buttons appear when > 10 interests

### F3.3 — Adoções (`/guardian/adoptions`)
- [ ] Adoption cards load showing pet name, species badge, status badge, adoption date
- [ ] Follow-up progress shown (e.g. "Aprovado: 0/3")
- [ ] Click on adoption card → navigates to detail page
- [ ] If no adoptions: empty state message
- [ ] Pagination buttons appear when > 10 adoptions

### F3.4 — Detalhe da adoção (`/guardian/adoptions/[id]`)
- [ ] Back link "Voltar" → returns to adoptions list
- [ ] Pet name and species displayed in header
- [ ] Status badge (Ativa/Concluída/Cancelada)
- [ ] Info grid: Organização, Data de adoção, Sobre o pet (if present), Observações (if present)
- [ ] Follow-up timeline: each item shows type label (30 dias/6 meses/1 ano), status badge, scheduled date
- [ ] Timeline icons: Clock (pendente), Circle (enviado), CheckCircle (aprovado), XCircle (rejeitado)
- [ ] Submission date shown when follow-up has a submission

### F3.5 — Perfil (`/guardian/profile`)
- [ ] Profile form loads with current name pre-filled
- [ ] Edit name → click "Salvar" → toast "Perfil atualizado com sucesso"
- [ ] Phone field editable
- [ ] Separator between profile and password sections
- [ ] Change password form: current password, new password, confirm password
- [ ] Submit with wrong current password → "Senha atual incorreta" error under field
- [ ] Submit with mismatched passwords → "As senhas não coincidem" error
- [ ] Successful password change → toast "Senha alterada com sucesso", form resets
