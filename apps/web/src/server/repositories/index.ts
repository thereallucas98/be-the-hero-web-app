import { prisma } from '~/lib/db'
import { createAdminCoverageRepository } from './admin-coverage.repository'
import { createAdoptionInterestRepository } from './adoption-interest.repository'
import { createAdoptionRepository } from './adoption.repository'
import { createAuditRepository } from './audit.repository'
import { createCampaignDocumentRepository } from './campaign-document.repository'
import { createCampaignRepository } from './campaign.repository'
import { createDonationRepository } from './donation.repository'
import { createFollowUpRepository } from './follow-up.repository'
import { createGeoPlaceRepository } from './geo-place.repository'
import { createPetRepository } from './pet.repository'
import { createUserRepository } from './user.repository'
import { createWorkspaceRepository } from './workspace.repository'

export const adminCoverageRepository = createAdminCoverageRepository(prisma)
export const adoptionInterestRepository =
  createAdoptionInterestRepository(prisma)
export const adoptionRepository = createAdoptionRepository(prisma)
export const auditRepository = createAuditRepository(prisma)
export const campaignRepository = createCampaignRepository(prisma)
export const campaignDocumentRepository =
  createCampaignDocumentRepository(prisma)
export const donationRepository = createDonationRepository(prisma)
export const followUpRepository = createFollowUpRepository(prisma)
export const userRepository = createUserRepository(prisma)
export const workspaceRepository = createWorkspaceRepository(prisma)
export const petRepository = createPetRepository(prisma)
export const geoPlaceRepository = createGeoPlaceRepository(prisma)
