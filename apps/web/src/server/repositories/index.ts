import { prisma } from '~/lib/db'
import { createAuditRepository } from './audit.repository'
import { createGeoPlaceRepository } from './geo-place.repository'
import { createPetRepository } from './pet.repository'
import { createUserRepository } from './user.repository'
import { createWorkspaceRepository } from './workspace.repository'

export const auditRepository = createAuditRepository(prisma)
export const userRepository = createUserRepository(prisma)
export const workspaceRepository = createWorkspaceRepository(prisma)
export const petRepository = createPetRepository(prisma)
export const geoPlaceRepository = createGeoPlaceRepository(prisma)
