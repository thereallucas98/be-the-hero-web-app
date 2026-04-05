# Exploration — F5.2–F5.6: Admin Approval Queues

## Pattern

All 5 queues: list → approve (POST, no body) → reject (POST, `{ reviewNote }`) → invalidate query.

## List response shapes

All return `{ items: T[], total, page, perPage }`.

### Workspaces
`{ id, name, type, verificationStatus, reviewNote, isActive, createdAt }`

### Campaigns
`{ id, title, description, goalAmount, currentAmount, status, workspaceId, createdAt }`

### Donations
`{ id, amount, donorName, donorEmail, status, campaignId, createdAt }`

### Follow-up submissions
`{ id, status, submittedAt, followUpId, ... }`

### Pets
Pets are listed via workspace pet list with status filter. Admin uses `GET /api/pets?status=PENDING_REVIEW`.

## Reject schema

All reject endpoints: `{ reviewNote: string }` (1-1000 chars).
