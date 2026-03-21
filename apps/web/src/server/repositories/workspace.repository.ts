import { Prisma } from '~/generated/prisma/client'
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

export interface WorkspaceDetailsItem {
  id: string
  name: string
  type: string
  description: string
  phone: string | null
  whatsapp: string | null
  emailPublic: string | null
  website: string | null
  instagram: string | null
  verificationStatus: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  primaryLocation: {
    id: string
    isPrimary: boolean
    lat: number
    lng: number
    addressLine: string | null
    neighborhood: string | null
    zipCode: string | null
    cityPlace: { id: string; name: string; slug: string; type: string }
  } | null
  cityCoverage: Array<{
    id: string
    name: string
    slug: string
    type: string
  }>
  members?: {
    items: Array<{
      id: string
      role: string
      user: { id: string; fullName: string }
    }>
    total: number
    page: number
    perPage: number
  }
}

export interface FindByIdWithDetailsOptions {
  membersPage?: number
  membersPerPage?: number
}

export interface UpdateWorkspaceBasicData {
  name?: string
  description?: string
  phone?: string
  whatsapp?: string
  emailPublic?: string
  website?: string
  instagram?: string
}

export interface UpdatePrimaryLocationData {
  cityPlaceId: string
  lat: number
  lng: number
  addressLine?: string
  neighborhood?: string
  zipCode?: string
}

export interface CreatedWorkspaceMemberItem {
  id: string
  role: string
  user: { id: string; fullName: string }
}

export type AddMemberResult =
  | { success: true; member: CreatedWorkspaceMemberItem }
  | {
      success: false
      code: 'WORKSPACE_NOT_FOUND' | 'USER_NOT_FOUND' | 'ALREADY_MEMBER'
    }

export interface WorkspaceForInterestsAccessItem {
  id: string
  workspaceCityIds: string[]
}

export interface WorkspaceAdminItem {
  id: string
  name: string
  type: string
  verificationStatus: string
  reviewNote: string | null
  verifiedAt: Date | null
  verifiedByUserId: string | null
  isActive: boolean
  createdAt: Date
}

export interface ListAdminWorkspacesInput {
  verificationStatus?: string
  page: number
  perPage: number
}

export interface ListAdminWorkspacesResult {
  items: WorkspaceAdminItem[]
  total: number
  page: number
  perPage: number
}

export interface WorkspaceRepository {
  createWithLocationAndMember(
    data: CreateWorkspaceData,
    userId: string,
  ): Promise<{ id: string; name: string; verificationStatus: string }>
  findMembershipsByUserId(userId: string): Promise<WorkspaceMembershipItem[]>
  findByIdWithDetails(
    id: string,
    options?: FindByIdWithDetailsOptions,
  ): Promise<WorkspaceDetailsItem | null>
  findByIdForInterestsAccess(
    id: string,
  ): Promise<WorkspaceForInterestsAccessItem | null>
  findByIdSimple(id: string): Promise<{
    id: string
    isActive: boolean
    verificationStatus: string
  } | null>
  updateBasicData(
    id: string,
    data: UpdateWorkspaceBasicData,
  ): Promise<WorkspaceDetailsItem | null>
  updatePrimaryLocation(
    workspaceId: string,
    data: UpdatePrimaryLocationData,
  ): Promise<WorkspaceDetailsItem | null>
  addMember(
    workspaceId: string,
    userId: string,
    role: 'OWNER' | 'EDITOR' | 'FINANCIAL',
  ): Promise<AddMemberResult>
  findMemberInWorkspace(
    workspaceId: string,
    memberId: string,
  ): Promise<{ id: string; userId: string; role: string } | null>
  countActiveOwners(workspaceId: string): Promise<number>
  deactivateMember(workspaceId: string, memberId: string): Promise<boolean>
  updateMemberRole(
    workspaceId: string,
    memberId: string,
    role: 'OWNER' | 'EDITOR' | 'FINANCIAL',
  ): Promise<{
    id: string
    role: string
    user: { id: string; fullName: string }
  } | null>
  listCityCoverage(workspaceId: string): Promise<
    Array<{
      id: string
      cityPlace: { id: string; name: string; slug: string; type: string }
    }>
  >
  addCityCoverage(
    workspaceId: string,
    cityPlaceId: string,
  ): Promise<{
    id: string
    cityPlace: { id: string; name: string; slug: string; type: string }
  }>
  removeCityCoverage(workspaceId: string, coverageId: string): Promise<boolean>
  deactivateWorkspace(id: string): Promise<boolean>
  listForAdmin(
    input: ListAdminWorkspacesInput,
  ): Promise<ListAdminWorkspacesResult>
  approveWorkspace(
    id: string,
    approvedByUserId: string,
  ): Promise<WorkspaceAdminItem>
  rejectWorkspace(id: string, reviewNote: string): Promise<WorkspaceAdminItem>
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

    async findByIdWithDetails(id, options = {}) {
      const { membersPage = 1, membersPerPage = 20 } = options

      const [workspace, totalMembers] = await Promise.all([
        prisma.partnerWorkspace.findUnique({
          where: { id, isActive: true },
          select: {
            id: true,
            name: true,
            type: true,
            description: true,
            phone: true,
            whatsapp: true,
            emailPublic: true,
            website: true,
            instagram: true,
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
                  select: { id: true, name: true, slug: true, type: true },
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
            members: {
              where: { isActive: true },
              skip: (membersPage - 1) * membersPerPage,
              take: membersPerPage,
              select: {
                id: true,
                role: true,
                user: {
                  select: { id: true, fullName: true },
                },
              },
            },
          },
        }),
        prisma.partnerMember.count({
          where: { workspaceId: id, isActive: true },
        }),
      ])

      if (!workspace) return null

      const primaryLocation = workspace.locations[0] ?? null
      const cityCoverage = workspace.cityCoverage.map((c) => c.cityPlace)

      const result: WorkspaceDetailsItem = {
        id: workspace.id,
        name: workspace.name,
        type: workspace.type,
        description: workspace.description,
        phone: workspace.phone,
        whatsapp: workspace.whatsapp,
        emailPublic: workspace.emailPublic,
        website: workspace.website,
        instagram: workspace.instagram,
        verificationStatus: workspace.verificationStatus,
        isActive: workspace.isActive,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
        primaryLocation: primaryLocation
          ? {
              ...primaryLocation,
              cityPlace: primaryLocation.cityPlace,
            }
          : null,
        cityCoverage,
        members: {
          items: workspace.members.map((m) => ({
            id: m.id,
            role: m.role,
            user: m.user,
          })),
          total: totalMembers,
          page: membersPage,
          perPage: membersPerPage,
        },
      }

      return result
    },

    async findByIdForInterestsAccess(id) {
      const workspace = await prisma.partnerWorkspace.findUnique({
        where: { id, isActive: true },
        select: {
          id: true,
          locations: {
            where: { isPrimary: true },
            select: { cityPlaceId: true },
          },
          cityCoverage: { select: { cityPlaceId: true } },
        },
      })
      if (!workspace) return null

      const cityIds = new Set<string>()
      workspace.locations.forEach((l) => cityIds.add(l.cityPlaceId))
      workspace.cityCoverage.forEach((c) => cityIds.add(c.cityPlaceId))

      return {
        id: workspace.id,
        workspaceCityIds: Array.from(cityIds),
      }
    },

    async findByIdSimple(id) {
      return prisma.partnerWorkspace.findUnique({
        where: { id },
        select: { id: true, isActive: true, verificationStatus: true },
      })
    },

    async updateBasicData(id, data) {
      const payload: {
        name?: string
        description?: string
        phone?: string | null
        whatsapp?: string | null
        emailPublic?: string | null
        website?: string | null
        instagram?: string | null
      } = {}
      if (data.name !== undefined) payload.name = data.name
      if (data.description !== undefined) payload.description = data.description
      if (data.phone !== undefined) payload.phone = data.phone || null
      if (data.whatsapp !== undefined) payload.whatsapp = data.whatsapp || null
      if (data.emailPublic !== undefined)
        payload.emailPublic = data.emailPublic || null
      if (data.website !== undefined) payload.website = data.website || null
      if (data.instagram !== undefined)
        payload.instagram = data.instagram || null

      if (Object.keys(payload).length === 0) {
        return this.findByIdWithDetails(id)
      }

      await prisma.partnerWorkspace.update({ where: { id }, data: payload })

      return this.findByIdWithDetails(id)
    },

    async updatePrimaryLocation(workspaceId, data) {
      const workspace = await prisma.partnerWorkspace.findUnique({
        where: { id: workspaceId, isActive: true },
        select: { id: true },
      })
      if (!workspace) return null

      await prisma.$transaction(async (tx) => {
        const primary = await tx.partnerWorkspaceLocation.findFirst({
          where: { workspaceId, isPrimary: true },
        })

        if (primary) {
          await tx.partnerWorkspaceLocation.update({
            where: { id: primary.id },
            data: {
              cityPlaceId: data.cityPlaceId,
              lat: data.lat,
              lng: data.lng,
              addressLine: data.addressLine ?? null,
              neighborhood: data.neighborhood ?? null,
              zipCode: data.zipCode ?? null,
            },
          })
        } else {
          await tx.partnerWorkspaceLocation.create({
            data: {
              workspaceId,
              cityPlaceId: data.cityPlaceId,
              lat: data.lat,
              lng: data.lng,
              addressLine: data.addressLine ?? null,
              neighborhood: data.neighborhood ?? null,
              zipCode: data.zipCode ?? null,
              isPrimary: true,
            },
          })
        }

        await tx.partnerCityCoverage.upsert({
          where: {
            workspaceId_cityPlaceId: {
              workspaceId,
              cityPlaceId: data.cityPlaceId,
            },
          },
          create: { workspaceId, cityPlaceId: data.cityPlaceId },
          update: {},
        })
      })

      return this.findByIdWithDetails(workspaceId)
    },

    async addMember(workspaceId, userId, role) {
      type TxResult =
        | { ok: false; code: 'WORKSPACE_NOT_FOUND' | 'USER_NOT_FOUND' }
        | {
            ok: true
            member: {
              id: string
              role: string
              user: { id: string; fullName: string }
            }
          }

      try {
        const result = (await prisma.$transaction(async (tx) => {
          const workspace = await tx.partnerWorkspace.findUnique({
            where: { id: workspaceId, isActive: true },
          })
          if (!workspace) {
            return { ok: false, code: 'WORKSPACE_NOT_FOUND' as const }
          }

          const user = await tx.user.findUnique({
            where: { id: userId, isActive: true },
            select: { id: true, fullName: true },
          })
          if (!user) {
            return { ok: false, code: 'USER_NOT_FOUND' as const }
          }

          const created = await tx.partnerMember.create({
            data: {
              workspaceId,
              userId,
              role: role as 'OWNER' | 'EDITOR' | 'FINANCIAL',
            },
            select: {
              id: true,
              role: true,
              user: { select: { id: true, fullName: true } },
            },
          })
          return { ok: true, member: created } satisfies TxResult
        })) as TxResult

        if (!result.ok) {
          return {
            success: false,
            code: result.code,
          }
        }

        const member = result.member
        return {
          success: true as const,
          member: {
            id: member.id,
            role: member.role,
            user: member.user,
          },
        }
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002'
        ) {
          return { success: false, code: 'ALREADY_MEMBER' as const }
        }
        throw e
      }
    },

    async findMemberInWorkspace(workspaceId, memberId) {
      const member = await prisma.partnerMember.findFirst({
        where: {
          id: memberId,
          workspaceId,
          isActive: true,
        },
        select: { id: true, userId: true, role: true },
      })
      return member
    },

    async countActiveOwners(workspaceId) {
      return prisma.partnerMember.count({
        where: {
          workspaceId,
          isActive: true,
          role: 'OWNER',
        },
      })
    },

    async deactivateMember(workspaceId, memberId) {
      const result = await prisma.partnerMember.updateMany({
        where: {
          id: memberId,
          workspaceId,
          isActive: true,
        },
        data: { isActive: false },
      })
      return result.count > 0
    },

    async listCityCoverage(workspaceId) {
      return prisma.partnerCityCoverage.findMany({
        where: { workspaceId },
        select: {
          id: true,
          cityPlace: {
            select: { id: true, name: true, slug: true, type: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      })
    },

    async addCityCoverage(workspaceId, cityPlaceId) {
      return prisma.partnerCityCoverage.create({
        data: { workspaceId, cityPlaceId },
        select: {
          id: true,
          cityPlace: {
            select: { id: true, name: true, slug: true, type: true },
          },
        },
      })
    },

    async removeCityCoverage(workspaceId, coverageId) {
      const result = await prisma.partnerCityCoverage.deleteMany({
        where: { id: coverageId, workspaceId },
      })
      return result.count > 0
    },

    async updateMemberRole(workspaceId, memberId, role) {
      const existing = await prisma.partnerMember.findFirst({
        where: { id: memberId, workspaceId, isActive: true },
      })
      if (!existing) return null

      const updated = await prisma.partnerMember.update({
        where: { id: memberId },
        data: { role },
        select: {
          id: true,
          role: true,
          user: { select: { id: true, fullName: true } },
        },
      })
      return updated
    },

    async deactivateWorkspace(id) {
      const result = await prisma.partnerWorkspace.updateMany({
        where: { id, isActive: true },
        data: { isActive: false },
      })
      return result.count > 0
    },

    async listForAdmin({ verificationStatus, page, perPage }) {
      const where = verificationStatus
        ? { verificationStatus: verificationStatus as never }
        : {}
      const adminSelect = {
        id: true,
        name: true,
        type: true,
        verificationStatus: true,
        reviewNote: true,
        verifiedAt: true,
        verifiedByUserId: true,
        isActive: true,
        createdAt: true,
      } as const
      const [items, total] = await Promise.all([
        prisma.partnerWorkspace.findMany({
          where,
          select: adminSelect,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        prisma.partnerWorkspace.count({ where }),
      ])
      return { items, total, page, perPage }
    },

    async approveWorkspace(id, approvedByUserId) {
      return prisma.partnerWorkspace.update({
        where: { id },
        data: {
          verificationStatus: 'APPROVED',
          verifiedAt: new Date(),
          verifiedByUserId: approvedByUserId,
          reviewNote: null,
        },
        select: {
          id: true,
          name: true,
          type: true,
          verificationStatus: true,
          reviewNote: true,
          verifiedAt: true,
          verifiedByUserId: true,
          isActive: true,
          createdAt: true,
        },
      })
    },

    async rejectWorkspace(id, reviewNote) {
      return prisma.partnerWorkspace.update({
        where: { id },
        data: {
          verificationStatus: 'REJECTED',
          verifiedAt: new Date(),
          reviewNote,
        },
        select: {
          id: true,
          name: true,
          type: true,
          verificationStatus: true,
          reviewNote: true,
          verifiedAt: true,
          verifiedByUserId: true,
          isActive: true,
          createdAt: true,
        },
      })
    },
  }
}
