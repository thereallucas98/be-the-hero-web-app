# Exploration — Admin Detail Views

## Pet detail shape (GET /api/pets/:id)
`{ id, name, description, species, sex, size, ageCategory, energyLevel, independenceLevel, environment, adoptionRequirements, images: [{ id, url, isCover }], requirements: [{ id, category, title, description, isMandatory }], workspace: { id, name, phone, whatsapp } }`

## Workspace detail (GET /api/workspaces/:id)
Full workspace object with members.

## Campaign detail (GET /api/campaigns/:id)
`CampaignDetailItem` — includes `documents: [{ id, type, title, status }]`, `workspace`, `pet`.

## Donation list item already includes
`id, amount, currency, paymentMethod, proofUrl, status, reviewNote, createdAt`

## Follow-up submission list item already includes
`id, status, submittedAt, photoUrl, message, followUp: { id, type, adoption: { pet, workspace } }`
