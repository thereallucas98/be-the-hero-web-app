# Validation — F4.6: Workspace Campaign Management

## Build validation

| Check | Status |
|---|---|
| `pnpm lint` passes (0 warnings) | ✅ |
| `pnpm build` succeeds | ✅ |
| Campaign routes in build output | ✅ `/workspaces/[id]/campaigns`, `/workspaces/[id]/campaigns/[campaignId]` |

## Browser QA Checklist

### Campaign list (`/workspaces/{id}/campaigns`)
- [ ] Page loads with campaigns list
- [ ] Status filter tabs work (Todos, Rascunho, Em revisão, Aprovadas, Rejeitadas)
- [ ] Campaign cards show title, status badge, progress bar, amounts
- [ ] Click on card → navigates to detail page
- [ ] Empty state when no campaigns ("Nenhuma campanha encontrada.")
- [ ] Pagination works when > 10 campaigns

### Create campaign
- [ ] Click "Nova campanha" → dialog opens
- [ ] Fill title, description, goal → "Criar campanha" → toast success
- [ ] New campaign appears in list with DRAFT status
- [ ] Validation errors shown for empty/short fields

### Campaign detail (`/workspaces/{id}/campaigns/{campaignId}`)
- [ ] Back link "Voltar" → returns to list
- [ ] Title, description, status badge, progress bar displayed
- [ ] Pet name shown if campaign has a pet
- [ ] Review note shown if campaign was rejected

### Edit campaign (DRAFT only)
- [ ] "Editar" button visible for DRAFT campaigns
- [ ] Dialog opens with pre-filled values
- [ ] Edit title → "Salvar" → toast success, page updates
- [ ] "Editar" button hidden for non-DRAFT campaigns

### Submit for review
- [ ] "Submeter para revisão" button visible for DRAFT campaigns
- [ ] Button disabled if no documents (tooltip explains why)
- [ ] With documents: click → toast "Campanha submetida para revisão", status changes

### Documents section
- [ ] Shows document list if documents exist
- [ ] Shows empty state with info message if no documents

### Donations section
- [ ] Shows donations list if donations exist
- [ ] Each donation shows donor name, date, amount, status
- [ ] Pagination for donations
- [ ] "Nenhuma doação registrada." when empty

### Sidebar
- [ ] "Campanhas" (Megaphone icon) appears in workspace sidebar
- [ ] Highlighted when on campaigns pages
