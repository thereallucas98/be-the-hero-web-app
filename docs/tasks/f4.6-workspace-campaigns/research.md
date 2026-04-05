# Research — F4.6: Workspace Campaign Management

## Decision 1 — Data fetching: React Query + REST

Same as F4.5 — GraphQL doesn't cover workspace scope yet.

## Decision 2 — Create campaign: Dialog vs page

Use Dialog — the form is small (title, description, goal, optional pet). Consistent with the pattern of keeping the user in context.

## Decision 3 — Edit campaign: inline Dialog

Reuse the same form dialog for create and edit. Pass optional campaign prop to pre-fill.

## Decision 4 — Campaign detail: separate page

Campaign detail has enough content (info, documents, donations) to justify a separate page at `workspaces/[id]/campaigns/[campaignId]/page.tsx`.

## Decision 5 — Document upload: out of scope

File upload infrastructure doesn't exist. Show documents list if present but no upload form. Show info message: "Adicione documentos via API para submeter para revisão."

## Decision 6 — Status filter: tabs (same pattern as pets page)

Reuse the same tab pattern from `pets/page.tsx` — status tabs at the top.

## Summary

| Aspect | Decision |
|---|---|
| Data fetching | React Query + REST |
| Create/Edit | Dialog with shared form |
| Detail | Separate page |
| Documents | Read-only list, no upload |
| Status filter | Tabs |
