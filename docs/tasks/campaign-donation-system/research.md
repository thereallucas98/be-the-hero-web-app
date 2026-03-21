# Research — Campaign & Donation System

## Key Decisions

**submit-for-review gate**: Must have ≥ 1 document to submit. Status must be DRAFT. → error code `NO_DOCUMENTS` or `CAMPAIGN_NOT_REVIEWABLE`.

**GET /campaigns/:id visibility**:
- APPROVED campaigns: public (no auth)
- Non-APPROVED: workspace OWNER/EDITOR or ADMIN/SUPER_ADMIN only
- Use case receives `principal | null`; checks status + RBAC

**Donation workspaceId**: Derived from `campaign.workspaceId` at creation time — not sent by client.

**currentAmount increment**: Done in `approveDonation` use case via Prisma transaction: approve donation + increment `campaign.currentAmount`.

**PENDING_DOCUMENTS status**: Schema has it but roadmap flow is DRAFT → PENDING_REVIEW. We use PENDING_DOCUMENTS only as a potential "rejected but needs docs" target — for now reject always → REJECTED.

**Campaign update guard**: Only DRAFT campaigns can be updated. Error: `CAMPAIGN_NOT_EDITABLE`.

**Admin list campaigns**: Filter by `status` (optional), `workspaceId` (optional), pagination.

**Public donation list**: Returns `{ id, amount, currency, paymentMethod, createdAt }` — no userId, no proofUrl.

**Decimal serialization**: Prisma returns `Decimal` objects. They serialize to strings via `.toString()`. Accept as strings from the client via `z.string()` and let Prisma handle conversion (or use `z.number()` and coerce). Use `z.number().positive()` for goalAmount/amount — consistent with existing numeric fields.

## Edge Cases

| Case | Handling |
|---|---|
| Create campaign with invalid petId | `PET_NOT_FOUND` → 404 |
| Update PENDING_REVIEW campaign | `CAMPAIGN_NOT_EDITABLE` → 409 |
| Submit with 0 documents | `NO_DOCUMENTS` → 409 |
| Submit non-DRAFT campaign | `CAMPAIGN_NOT_REVIEWABLE` → 409 |
| Approve already-APPROVED campaign | `CAMPAIGN_NOT_APPROVABLE` → 409 |
| Donate to non-APPROVED campaign | `CAMPAIGN_NOT_APPROVED` → 409 |
| Remove document from non-DRAFT campaign | `CAMPAIGN_NOT_EDITABLE` → 409 |
