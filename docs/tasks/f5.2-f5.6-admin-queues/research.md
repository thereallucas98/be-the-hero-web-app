# Research — F5.2–F5.6: Admin Approval Queues

## Decision 1 — Shared reject dialog component

One `RejectDialog` component used by all 5 queues. Takes `open`, `onConfirm(reviewNote)`, `isSubmitting`.

## Decision 2 — No shared generic queue component

Each page is simple enough (~80 lines) that a generic abstraction adds more complexity than it saves. Copy the pattern with minimal changes per queue.

## Decision 3 — Optimistic updates for approve

Remove item from list immediately on approve (optimistic), invalidate on settle. Reject closes dialog and invalidates.

## Summary

| Aspect | Decision |
|---|---|
| Reject dialog | Shared component |
| Queue abstraction | No — copy pattern per page |
| Approve | Optimistic removal + invalidate |
