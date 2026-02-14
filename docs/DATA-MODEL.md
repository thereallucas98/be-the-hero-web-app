# BeTheHero Data Model (MVP) — Entities and Relationships

This document describes the MVP data model for BeTheHero, including entities, key fields, and relationships. It is organized from the core identity layer (users and roles) to partner workspaces, adoption content (pets), social support (campaigns/donations), responsibility (adoptions/follow-ups), and finally auditing and metrics.

**Notes:**

- IDs are UUIDs unless stated otherwise
- Some fields are optional in the MVP but included to avoid future refactors
- Approval/moderation is modeled via status enums and reviewer references
- Location is normalized to support future "nearby" search and indexing

---

## 1. User

Represents any authenticated person in the platform.

**Key fields:** id, fullName, email (unique), phone (optional), role (enum), isActive, createdAt, updatedAt

**Role enum:** SUPER_ADMIN | ADMIN | GUARDIAN | PARTNER_MEMBER

**Relationships:**

- User (ADMIN/SUPER_ADMIN) moderates: PartnerWorkspace, Pet, PetImage, Campaign, CampaignDocument, Donation, AdoptionFollowUpSubmission
- User (GUARDIAN) creates: AdoptionInterest, Donation, AdoptionFollowUpSubmission
- User can be linked to PartnerWorkspace via PartnerMember
- User (ADMIN) is linked to cities via AdminCoverage

---

## 2. GeoPlace (Country/State/City)

Single hierarchical table for places, enabling consistent indexing and "nearby" features.

**Key fields:** id, type (enum), name, code (optional), slug, parentId (nullable), lat (optional), lng (optional), isActive, createdAt, updatedAt

**Type enum:** COUNTRY | STATE | CITY

**Relationships:**

- GeoPlace (CITY) → PartnerWorkspaceLocation.cityPlaceId
- GeoPlace (CITY) → PartnerCityCoverage.cityPlaceId
- GeoPlace (CITY) → AdminCoverage.cityPlaceId

---

## 3. PartnerWorkspace

Represents a partner project (NGO, clinic, petshop, independent protector).

**Key fields:** id, name, type (enum), description, phone, whatsapp, emailPublic, website, instagram, verificationStatus (enum), verifiedAt, verifiedByUserId, isActive, createdAt, updatedAt

**Type enum:** ONG | CLINIC | PETSHOP | INDEPENDENT

**VerificationStatus enum:** PENDING | APPROVED | REJECTED

**Relationships:**

- PartnerWorkspace has members via PartnerMember
- PartnerWorkspace has primary location via PartnerWorkspaceLocation
- PartnerWorkspace can cover cities via PartnerCityCoverage (MVP: 1 city)
- PartnerWorkspace owns: Pets, Campaigns, Donations, Adoptions, PetMetricEvents

---

## 4. PartnerMember

Bridge between User and PartnerWorkspace.

**Key fields:** id, workspaceId, userId, role (enum), isActive, createdAt, updatedAt

**Role enum:** OWNER | EDITOR | FINANCIAL

**Relationships:** PartnerWorkspace 1→N PartnerMember | User 1→N PartnerMember

---

## 5. PartnerWorkspaceLocation

Primary point (lat/lng) for "nearby" indexing.

**Key fields:** id, workspaceId, label, addressLine, neighborhood, zipCode, cityPlaceId, lat, lng, isPrimary, createdAt, updatedAt

**Relationships:** PartnerWorkspace 1→1 PartnerWorkspaceLocation (MVP) | GeoPlace (CITY) 1→N PartnerWorkspaceLocation

---

## 6. PartnerCityCoverage

Cities a partner operates in.

**Key fields:** id, workspaceId, cityPlaceId, createdAt

**Relationships:** PartnerWorkspace 1→N | GeoPlace (CITY) 1→N

---

## 7. Pet

Adoptable animal. Belongs to workspace; city inferred from workspace.

**Key fields:** id, workspaceId, name, description, species (enum), sex (enum), size (enum), ageCategory (enum), energyLevel (optional), independenceLevel (optional), environment (optional), adoptionRequirements (optional), status (enum), approvedAt, approvedByUserId, isActive, createdAt, updatedAt

**Enums:** species (DOG | CAT | OTHER), sex (MALE | FEMALE), size (SMALL | MEDIUM | LARGE), ageCategory (PUPPY | YOUNG | ADULT | SENIOR), status (DRAFT | PENDING_REVIEW | APPROVED | REJECTED | ADOPTED)

**Relationships:**

- PartnerWorkspace 1→N Pet
- Pet 1→N PetImage, PetRequirement, AdoptionInterest, PetMetricEvent
- Pet 1→0..1 Adoption
- Pet 0..1→N Campaign

---

## 8. PetImage

Pet photos (up to 5). Moderated independently.

**Key fields:** id, petId, url, storagePath, position (1..5), isCover, status (enum), approvedAt, approvedByUserId, createdAt

**Status enum:** PENDING_REVIEW | APPROVED | REJECTED

**Relationships:** Pet 1→N PetImage

---

## 9. PetRequirement

Structured adoption requirements.

**Key fields:** id, petId, category (enum), title, description, isMandatory, order, createdAt, updatedAt

**Category enum:** HOME | EXPERIENCE | TIME_AVAILABILITY | FINANCIAL | SAFETY | HEALTH_CARE | OTHER

**Relationships:** Pet 1→N PetRequirement

---

## 10. AdoptionInterest

Guardian interest in a pet. Requires login.

**Key fields:** id, userId, petId, workspaceId (redundant), message, channel (enum), createdAt

**Channel enum:** WHATSAPP (MVP)

**Constraint:** unique(userId, petId)

**Relationships:** User (GUARDIAN) 1→N | Pet 1→N | PartnerWorkspace 1→N

---

## 11. Campaign

Donation campaign ("vaquinha"). Can be general or linked to a pet.

**Key fields:** id, workspaceId, petId (optional), title, description, goalAmount, currentAmount, currency, coverImageUrl, status (enum), approvedAt, approvedByUserId, startsAt, endsAt, createdAt, updatedAt

**Status enum:** DRAFT | PENDING_DOCUMENTS | PENDING_REVIEW | APPROVED | REJECTED | CLOSED

**Relationships:** PartnerWorkspace 1→N | Pet 0..1→N | Campaign 1→N CampaignDocument, Donation

---

## 12. CampaignDocument

Private documents supporting a campaign (not public in MVP).

**Key fields:** id, campaignId, type (enum), title, description, fileUrl, storagePath, status (enum), reviewedAt, reviewedByUserId, createdAt

**Type enum:** MEDICAL_REPORT | COST_ESTIMATE | INVOICE | PHOTO_EVIDENCE | OTHER

**Status enum:** PENDING_REVIEW | APPROVED | REJECTED

**Relationships:** Campaign 1→N CampaignDocument

---

## 13. Donation

Donation with manual proof upload (PIX/transfer). Private in MVP.

**Key fields:** id, campaignId, workspaceId, userId, amount, currency, paymentMethod (enum), proofUrl, storagePath, status (enum), reviewedAt, reviewedByUserId, reviewNote, createdAt, updatedAt

**PaymentMethod enum:** PIX | TRANSFER | OTHER

**Status enum:** PENDING_REVIEW | APPROVED | REJECTED

**Relationships:** Campaign 1→N | PartnerWorkspace 1→N | User (GUARDIAN) 1→N

---

## 14. Adoption

Links pet to guardian after adoption. Created by partner.

**Key fields:** id, petId (unique), workspaceId, guardianUserId, adoptedAt, notes, status (enum), createdByUserId, createdAt, updatedAt

**Status enum:** ACTIVE | COMPLETED | ARCHIVED

**Relationships:** Pet 1→0..1 Adoption | PartnerWorkspace 1→N | User (GUARDIAN) 1→N | Adoption 1→N AdoptionFollowUp

---

## 15. AdoptionFollowUp

Checkpoint schedule: 30 days, 6 months, 1 year.

**Key fields:** id, adoptionId, type (enum), scheduledAt, status (enum), currentSubmissionId, createdAt, updatedAt

**Type enum:** DAYS_30 | MONTHS_6 | YEAR_1

**Status enum:** PENDING | SUBMITTED | APPROVED | REJECTED

**Relationships:** Adoption 1→N AdoptionFollowUp (3 checkpoints in MVP) | AdoptionFollowUp 1→N AdoptionFollowUpSubmission

---

## 16. AdoptionFollowUpSubmission

Historical submissions for a follow-up checkpoint.

**Key fields:** id, followUpId, submittedByUserId, photoUrl, storagePath, message, submittedAt, status (enum), reviewedAt, reviewedByUserId, reviewNote, createdAt

**Status enum:** SUBMITTED | APPROVED | REJECTED

**Relationships:** AdoptionFollowUp 1→N | User (GUARDIAN) 1→N

---

## 17. AdminCoverage

Cities an ADMIN can moderate.

**Key fields:** id, adminUserId, cityPlaceId, createdAt

**Relationships:** User (ADMIN) 1→N | GeoPlace (CITY) 1→N

---

## 18. AuditLog

Tracks critical actions for traceability.

**Key fields:** id, actorUserId, action (enum), entityType (enum), entityId, metadata (jsonb), createdAt

**Action enum:** CREATE | UPDATE | SUBMIT_FOR_REVIEW | APPROVE | REJECT | STATUS_CHANGE

**EntityType enum:** PARTNER_WORKSPACE | PET | PET_IMAGE | CAMPAIGN | CAMPAIGN_DOCUMENT | DONATION | ADOPTION | FOLLOW_UP | FOLLOW_UP_SUBMISSION | USER

**Relationships:** User 1→N AuditLog

---

## 19. PetMetricEvent

Event-based metrics: views, WhatsApp clicks, interest registrations.

**Key fields:** id, petId, workspaceId, userId (optional), sessionId, ipHash (hashed only), type (enum), createdAt

**Type enum:** VIEW_PET | CLICK_WHATSAPP | REGISTER_INTEREST

**Relationships:** Pet 1→N | PartnerWorkspace 1→N | User 0..1→N

---

## Relationship Summary

| Entity | Relationships |
|--------|----------------|
| **User** | 1→N PartnerMember, AdoptionInterest, Donation, Adoption, AdoptionFollowUpSubmission, AuditLog; (ADMIN) 1→N AdminCoverage |
| **GeoPlace** | COUNTRY→STATE→CITY; CITY→PartnerWorkspaceLocation, PartnerCityCoverage, AdminCoverage |
| **PartnerWorkspace** | 1→N PartnerMember; 1→1 PartnerWorkspaceLocation; 1→N PartnerCityCoverage, Pet, Campaign, Donation, Adoption, PetMetricEvent |
| **Pet** | 1→N PetImage, PetRequirement, AdoptionInterest, PetMetricEvent; 1→0..1 Adoption |
| **Campaign** | 1→N CampaignDocument, Donation; 0..1→Pet |
| **Adoption** | 1→N AdoptionFollowUp (3 checkpoints) |
| **AdoptionFollowUp** | 1→N AdoptionFollowUpSubmission |

---

## MVP Regional Setup (Initial Seed)

- **GeoPlace:** COUNTRY "Brazil" (code BR) → STATE "Paraíba" (code PB) → CITIES João Pessoa, Campina Grande, Bayeux, Santa Rita
- **AdminCoverage:** assign SUPER_ADMIN/ADMIN to these cities
- **Enforce:** one primary PartnerWorkspaceLocation per workspace
- **Enforce:** one PartnerCityCoverage per workspace in MVP
