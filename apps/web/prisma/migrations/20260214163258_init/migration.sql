-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'GUARDIAN', 'PARTNER_MEMBER');

-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('ONG', 'CLINIC', 'PETSHOP', 'INDEPENDENT');

-- CreateEnum
CREATE TYPE "GeoPlaceType" AS ENUM ('COUNTRY', 'STATE', 'CITY');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PartnerMemberRole" AS ENUM ('OWNER', 'EDITOR', 'FINANCIAL');

-- CreateEnum
CREATE TYPE "PetSpecies" AS ENUM ('DOG', 'CAT', 'RABBIT', 'BIRD', 'HORSE', 'COW', 'GOAT', 'PIG', 'TURTLE', 'OTHER');

-- CreateEnum
CREATE TYPE "PetSex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "PetSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "PetAgeCategory" AS ENUM ('PUPPY', 'YOUNG', 'ADULT', 'SENIOR');

-- CreateEnum
CREATE TYPE "PetEnergyLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "PetIndependenceLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "PetEnvironment" AS ENUM ('HOUSE', 'APARTMENT', 'BOTH');

-- CreateEnum
CREATE TYPE "PetStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ADOPTED');

-- CreateEnum
CREATE TYPE "PetImageStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PetRequirementCategory" AS ENUM ('HOME', 'EXPERIENCE', 'TIME_AVAILABILITY', 'FINANCIAL', 'SAFETY', 'HEALTH_CARE', 'OTHER');

-- CreateEnum
CREATE TYPE "AdoptionInterestChannel" AS ENUM ('WHATSAPP');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'PENDING_DOCUMENTS', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CampaignDocumentType" AS ENUM ('MEDICAL_REPORT', 'COST_ESTIMATE', 'INVOICE', 'PHOTO_EVIDENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "CampaignDocumentStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "AdoptionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AdoptionFollowUpType" AS ENUM ('DAYS_30', 'MONTHS_6', 'YEAR_1');

-- CreateEnum
CREATE TYPE "AdoptionFollowUpStatus" AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FollowUpSubmissionStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'SUBMIT_FOR_REVIEW', 'APPROVE', 'REJECT', 'STATUS_CHANGE');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('PARTNER_WORKSPACE', 'PET', 'PET_IMAGE', 'CAMPAIGN', 'CAMPAIGN_DOCUMENT', 'DONATION', 'ADOPTION', 'FOLLOW_UP', 'FOLLOW_UP_SUBMISSION', 'USER');

-- CreateEnum
CREATE TYPE "PetMetricEventType" AS ENUM ('VIEW_PET', 'CLICK_WHATSAPP', 'REGISTER_INTEREST');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "resetToken" TEXT,
    "resetTokenExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geo_place" (
    "id" TEXT NOT NULL,
    "type" "GeoPlaceType" NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "geo_place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PartnerType" NOT NULL,
    "description" TEXT NOT NULL,
    "phone" TEXT,
    "whatsapp" TEXT,
    "emailPublic" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verifiedByUserId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_member" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "PartnerMemberRole" NOT NULL DEFAULT 'OWNER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_workspace_location" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "label" TEXT,
    "addressLine" TEXT,
    "neighborhood" TEXT,
    "zipCode" TEXT,
    "cityPlaceId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_workspace_location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_city_coverage" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "cityPlaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_city_coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pet" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "species" "PetSpecies" NOT NULL,
    "sex" "PetSex" NOT NULL,
    "size" "PetSize" NOT NULL,
    "ageCategory" "PetAgeCategory" NOT NULL,
    "energyLevel" "PetEnergyLevel",
    "independenceLevel" "PetIndependenceLevel",
    "environment" "PetEnvironment",
    "adoptionRequirements" TEXT,
    "status" "PetStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedAt" TIMESTAMP(3),
    "approvedByUserId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pet_image" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "status" "PetImageStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "approvedAt" TIMESTAMP(3),
    "approvedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pet_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pet_requirement" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "category" "PetRequirementCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pet_requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adoption_interest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "message" TEXT,
    "channel" "AdoptionInterestChannel" NOT NULL DEFAULT 'WHATSAPP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adoption_interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "petId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "goalAmount" DECIMAL(12,2) NOT NULL,
    "currentAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "coverImageUrl" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedAt" TIMESTAMP(3),
    "approvedByUserId" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_document" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "type" "CampaignDocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" "CampaignDocumentStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donation" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "proofUrl" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adoption" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "guardianUserId" TEXT NOT NULL,
    "adoptedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "status" "AdoptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adoption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adoption_follow_up" (
    "id" TEXT NOT NULL,
    "adoptionId" TEXT NOT NULL,
    "type" "AdoptionFollowUpType" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "AdoptionFollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "currentSubmissionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adoption_follow_up_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adoption_follow_up_submission" (
    "id" TEXT NOT NULL,
    "followUpId" TEXT NOT NULL,
    "submittedByUserId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "message" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "FollowUpSubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adoption_follow_up_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_coverage" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "cityPlaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entityType" "AuditEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pet_metric_event" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" "PetMetricEventType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pet_metric_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "geo_place_slug_key" ON "geo_place"("slug");

-- CreateIndex
CREATE INDEX "geo_place_type_idx" ON "geo_place"("type");

-- CreateIndex
CREATE INDEX "geo_place_parentId_idx" ON "geo_place"("parentId");

-- CreateIndex
CREATE INDEX "partner_workspace_verificationStatus_idx" ON "partner_workspace"("verificationStatus");

-- CreateIndex
CREATE INDEX "partner_member_userId_idx" ON "partner_member"("userId");

-- CreateIndex
CREATE INDEX "partner_member_workspaceId_idx" ON "partner_member"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "partner_member_workspaceId_userId_key" ON "partner_member"("workspaceId", "userId");

-- CreateIndex
CREATE INDEX "partner_workspace_location_workspaceId_idx" ON "partner_workspace_location"("workspaceId");

-- CreateIndex
CREATE INDEX "partner_workspace_location_cityPlaceId_idx" ON "partner_workspace_location"("cityPlaceId");

-- CreateIndex
CREATE INDEX "partner_city_coverage_workspaceId_idx" ON "partner_city_coverage"("workspaceId");

-- CreateIndex
CREATE INDEX "partner_city_coverage_cityPlaceId_idx" ON "partner_city_coverage"("cityPlaceId");

-- CreateIndex
CREATE UNIQUE INDEX "partner_city_coverage_workspaceId_cityPlaceId_key" ON "partner_city_coverage"("workspaceId", "cityPlaceId");

-- CreateIndex
CREATE INDEX "pet_workspaceId_idx" ON "pet"("workspaceId");

-- CreateIndex
CREATE INDEX "pet_status_idx" ON "pet"("status");

-- CreateIndex
CREATE INDEX "pet_approvedByUserId_idx" ON "pet"("approvedByUserId");

-- CreateIndex
CREATE INDEX "pet_image_petId_idx" ON "pet_image"("petId");

-- CreateIndex
CREATE INDEX "pet_image_status_idx" ON "pet_image"("status");

-- CreateIndex
CREATE UNIQUE INDEX "pet_image_petId_position_key" ON "pet_image"("petId", "position");

-- CreateIndex
CREATE INDEX "pet_requirement_petId_idx" ON "pet_requirement"("petId");

-- CreateIndex
CREATE INDEX "pet_requirement_category_idx" ON "pet_requirement"("category");

-- CreateIndex
CREATE UNIQUE INDEX "pet_requirement_petId_order_key" ON "pet_requirement"("petId", "order");

-- CreateIndex
CREATE INDEX "adoption_interest_userId_idx" ON "adoption_interest"("userId");

-- CreateIndex
CREATE INDEX "adoption_interest_petId_idx" ON "adoption_interest"("petId");

-- CreateIndex
CREATE INDEX "adoption_interest_workspaceId_idx" ON "adoption_interest"("workspaceId");

-- CreateIndex
CREATE INDEX "adoption_interest_createdAt_idx" ON "adoption_interest"("createdAt");

-- CreateIndex
CREATE INDEX "campaign_workspaceId_idx" ON "campaign"("workspaceId");

-- CreateIndex
CREATE INDEX "campaign_petId_idx" ON "campaign"("petId");

-- CreateIndex
CREATE INDEX "campaign_status_idx" ON "campaign"("status");

-- CreateIndex
CREATE INDEX "campaign_approvedByUserId_idx" ON "campaign"("approvedByUserId");

-- CreateIndex
CREATE INDEX "campaign_document_campaignId_idx" ON "campaign_document"("campaignId");

-- CreateIndex
CREATE INDEX "campaign_document_status_idx" ON "campaign_document"("status");

-- CreateIndex
CREATE INDEX "campaign_document_reviewedByUserId_idx" ON "campaign_document"("reviewedByUserId");

-- CreateIndex
CREATE INDEX "donation_campaignId_idx" ON "donation"("campaignId");

-- CreateIndex
CREATE INDEX "donation_workspaceId_idx" ON "donation"("workspaceId");

-- CreateIndex
CREATE INDEX "donation_userId_idx" ON "donation"("userId");

-- CreateIndex
CREATE INDEX "donation_status_idx" ON "donation"("status");

-- CreateIndex
CREATE INDEX "donation_reviewedByUserId_idx" ON "donation"("reviewedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "adoption_petId_key" ON "adoption"("petId");

-- CreateIndex
CREATE INDEX "adoption_workspaceId_idx" ON "adoption"("workspaceId");

-- CreateIndex
CREATE INDEX "adoption_guardianUserId_idx" ON "adoption"("guardianUserId");

-- CreateIndex
CREATE INDEX "adoption_createdByUserId_idx" ON "adoption"("createdByUserId");

-- CreateIndex
CREATE INDEX "adoption_status_idx" ON "adoption"("status");

-- CreateIndex
CREATE UNIQUE INDEX "adoption_follow_up_currentSubmissionId_key" ON "adoption_follow_up"("currentSubmissionId");

-- CreateIndex
CREATE INDEX "adoption_follow_up_adoptionId_idx" ON "adoption_follow_up"("adoptionId");

-- CreateIndex
CREATE INDEX "adoption_follow_up_status_idx" ON "adoption_follow_up"("status");

-- CreateIndex
CREATE UNIQUE INDEX "adoption_follow_up_adoptionId_type_key" ON "adoption_follow_up"("adoptionId", "type");

-- CreateIndex
CREATE INDEX "adoption_follow_up_submission_followUpId_idx" ON "adoption_follow_up_submission"("followUpId");

-- CreateIndex
CREATE INDEX "adoption_follow_up_submission_submittedByUserId_idx" ON "adoption_follow_up_submission"("submittedByUserId");

-- CreateIndex
CREATE INDEX "adoption_follow_up_submission_status_idx" ON "adoption_follow_up_submission"("status");

-- CreateIndex
CREATE INDEX "adoption_follow_up_submission_reviewedByUserId_idx" ON "adoption_follow_up_submission"("reviewedByUserId");

-- CreateIndex
CREATE INDEX "admin_coverage_adminUserId_idx" ON "admin_coverage"("adminUserId");

-- CreateIndex
CREATE INDEX "admin_coverage_cityPlaceId_idx" ON "admin_coverage"("cityPlaceId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_coverage_adminUserId_cityPlaceId_key" ON "admin_coverage"("adminUserId", "cityPlaceId");

-- CreateIndex
CREATE INDEX "audit_log_actorUserId_idx" ON "audit_log"("actorUserId");

-- CreateIndex
CREATE INDEX "audit_log_entityType_idx" ON "audit_log"("entityType");

-- CreateIndex
CREATE INDEX "audit_log_entityId_idx" ON "audit_log"("entityId");

-- CreateIndex
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");

-- CreateIndex
CREATE INDEX "pet_metric_event_petId_idx" ON "pet_metric_event"("petId");

-- CreateIndex
CREATE INDEX "pet_metric_event_workspaceId_idx" ON "pet_metric_event"("workspaceId");

-- CreateIndex
CREATE INDEX "pet_metric_event_type_idx" ON "pet_metric_event"("type");

-- CreateIndex
CREATE INDEX "pet_metric_event_createdAt_idx" ON "pet_metric_event"("createdAt");

-- AddForeignKey
ALTER TABLE "geo_place" ADD CONSTRAINT "geo_place_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "geo_place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_workspace" ADD CONSTRAINT "partner_workspace_verifiedByUserId_fkey" FOREIGN KEY ("verifiedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_member" ADD CONSTRAINT "partner_member_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "partner_workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_member" ADD CONSTRAINT "partner_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_workspace_location" ADD CONSTRAINT "partner_workspace_location_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "partner_workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_workspace_location" ADD CONSTRAINT "partner_workspace_location_cityPlaceId_fkey" FOREIGN KEY ("cityPlaceId") REFERENCES "geo_place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_city_coverage" ADD CONSTRAINT "partner_city_coverage_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "partner_workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_city_coverage" ADD CONSTRAINT "partner_city_coverage_cityPlaceId_fkey" FOREIGN KEY ("cityPlaceId") REFERENCES "geo_place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pet" ADD CONSTRAINT "pet_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "partner_workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pet" ADD CONSTRAINT "pet_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pet_image" ADD CONSTRAINT "pet_image_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pet_image" ADD CONSTRAINT "pet_image_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pet_requirement" ADD CONSTRAINT "pet_requirement_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_interest" ADD CONSTRAINT "adoption_interest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_interest" ADD CONSTRAINT "adoption_interest_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_interest" ADD CONSTRAINT "adoption_interest_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "partner_workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "partner_workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_document" ADD CONSTRAINT "campaign_document_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_document" ADD CONSTRAINT "campaign_document_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation" ADD CONSTRAINT "donation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation" ADD CONSTRAINT "donation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "partner_workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation" ADD CONSTRAINT "donation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation" ADD CONSTRAINT "donation_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption" ADD CONSTRAINT "adoption_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption" ADD CONSTRAINT "adoption_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "partner_workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption" ADD CONSTRAINT "adoption_guardianUserId_fkey" FOREIGN KEY ("guardianUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption" ADD CONSTRAINT "adoption_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_follow_up" ADD CONSTRAINT "adoption_follow_up_adoptionId_fkey" FOREIGN KEY ("adoptionId") REFERENCES "adoption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_follow_up" ADD CONSTRAINT "adoption_follow_up_currentSubmissionId_fkey" FOREIGN KEY ("currentSubmissionId") REFERENCES "adoption_follow_up_submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_follow_up_submission" ADD CONSTRAINT "adoption_follow_up_submission_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "adoption_follow_up"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_follow_up_submission" ADD CONSTRAINT "adoption_follow_up_submission_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_follow_up_submission" ADD CONSTRAINT "adoption_follow_up_submission_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_coverage" ADD CONSTRAINT "admin_coverage_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_coverage" ADD CONSTRAINT "admin_coverage_cityPlaceId_fkey" FOREIGN KEY ("cityPlaceId") REFERENCES "geo_place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pet_metric_event" ADD CONSTRAINT "pet_metric_event_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pet_metric_event" ADD CONSTRAINT "pet_metric_event_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "partner_workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
