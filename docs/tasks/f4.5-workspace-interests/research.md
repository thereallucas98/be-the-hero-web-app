# Research — F4.5: Workspace Adoption Interests

## Decision 1 — Data fetching: React Query + REST

GraphQL doesn't cover workspace scope yet (per the GraphQL infrastructure brief: "Workspace/admin schema added when F4/F5 are built"). Use React Query + REST `fetch()` for now.

## Decision 2 — Convert action: confirmation dialog

Converting an interest to an adoption is a significant, irreversible action. Use a Dialog (Radix) for confirmation with:
- Optional notes textarea
- Submit button "Confirmar adoção"
- Cancel button

Skip `adoptedAt` date picker for now — defaults to current date. Can be added later.

## Decision 3 — Dismiss action: inline confirm

Dismissing is lighter than converting. Use a simple AlertDialog (Radix) with "Tem certeza?" confirmation — no form fields needed.

## Decision 4 — Component extraction

Extract `WorkspaceInterestCard` to `components/features/workspaces/workspace-interest-card.tsx` — reusable for potential admin views later.

## Summary

| Aspect | Decision |
|---|---|
| Data fetching | React Query + REST (no GraphQL for workspace yet) |
| Convert action | Dialog with optional notes |
| Dismiss action | AlertDialog confirmation |
| Components | Extract WorkspaceInterestCard |
