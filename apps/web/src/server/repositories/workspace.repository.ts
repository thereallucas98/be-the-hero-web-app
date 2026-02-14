import type { PrismaClient } from '~/generated/prisma/client'

export interface CreateWorkspaceData {
  name: string
  type: string
  description: string
  phone?: string
  whatsapp?: string
  emailPublic?: string
  cityPlaceId: string
  lat: number
  lng: number
  addressLine?: string
  neighborhood?: string
  zipCode?: string
}

export interface WorkspaceMembershipItem {
  id: string
  role: string
  workspace: {
    id: string
    name: string
    type: string
    description: string
    verificationStatus: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    locations: Array<{
      id: string
      isPrimary: boolean
      lat: number
      lng: number
      addressLine: string | null
      neighborhood: string | null
      zipCode: string | null
      cityPlace: {
        id: string
        name: string
        slug: string
        type: string
        parent: unknown
      }
    }>
    cityCoverage: Array<{
      cityPlace: { id: string; name: string; slug: string; type: string }
    }>
  }
}

export interface WorkspaceRepository {
  createWithLocationAndMember(
    data: CreateWorkspaceData,
    userId: string,
  ): Promise<{ id: string; name: string; verificationStatus: string }>
  findMembershipsByUserId(userId: string): Promise<WorkspaceMembershipItem[]>
}

export function createWorkspaceRepository(
  prisma: PrismaClient,
): WorkspaceRepository {
  return {
    async createWithLocationAndMember(data, userId) {
      const result = await prisma.$transaction(async (tx) => {
        const workspace = await tx.partnerWorkspace.create({
          data: {
            name: data.name,
            type: data.type as 'ONG' | 'CLINIC' | 'PETSHOP' | 'INDEPENDENT',
            description: data.description,
            phone: data.phone,
            whatsapp: data.whatsapp,
            emailPublic: data.emailPublic,
          },
        })

        await tx.partnerWorkspaceLocation.create({
          data: {
            workspaceId: workspace.id,
            cityPlaceId: data.cityPlaceId,
            lat: data.lat,
            lng: data.lng,
            addressLine: data.addressLine,
            neighborhood: data.neighborhood,
            zipCode: data.zipCode,
            isPrimary: true,
          },
        })

        await tx.partnerCityCoverage.create({
          data: {
            workspaceId: workspace.id,
            cityPlaceId: data.cityPlaceId,
          },
        })

        await tx.partnerMember.create({
          data: {
            workspaceId: workspace.id,
            userId,
            role: 'OWNER',
          },
        })

        return workspace
      })
      return {
        id: result.id,
        name: result.name,
        verificationStatus: result.verificationStatus,
      }
    },

    async findMembershipsByUserId(userId) {
      const memberships = await prisma.partnerMember.findMany({
        where: { userId, isActive: true },
        select: {
          id: true,
          role: true,
          workspace: {
            select: {
              id: true,
              name: true,
              type: true,
              description: true,
              verificationStatus: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
              locations: {
                where: { isPrimary: true },
                take: 1,
                select: {
                  id: true,
                  isPrimary: true,
                  lat: true,
                  lng: true,
                  addressLine: true,
                  neighborhood: true,
                  zipCode: true,
                  cityPlace: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      type: true,
                      parent: {
                        select: {
                          id: true,
                          name: true,
                          code: true,
                          type: true,
                          parent: {
                            select: {
                              id: true,
                              name: true,
                              code: true,
                              type: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              cityCoverage: {
                select: {
                  cityPlace: {
                    select: { id: true, name: true, slug: true, type: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' as const },
      })
      return memberships as WorkspaceMembershipItem[]
    },
  }
}
