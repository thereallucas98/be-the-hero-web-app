import type { PrismaClient } from '~/generated/prisma/client'

export interface UserRepository {
  findByEmailForLogin(email: string): Promise<{
    id: string
    email: string
    fullName: string
    role: string
    isActive: boolean
    passwordHash: string
  } | null>
  findByIdForMe(id: string): Promise<{
    id: string
    fullName: string
    email: string
    role: string
    isActive: boolean
    emailVerified: boolean
    createdAt: Date
    updatedAt: Date
    partnerMembers: Array<{
      id: string
      role: string
      workspaceId: string
      workspace: {
        id: string
        name: string
        verificationStatus: string
        isActive: boolean
      }
    }>
    adminCoverage: Array<{
      cityPlaceId: string
      cityPlace: { id: string; name: string; slug: string; type: string }
    }>
  } | null>
  findByEmail(email: string): Promise<{ id: string } | null>
  findByIdWithRole(id: string): Promise<{ id: string; role: string } | null>
  create(data: {
    fullName: string
    email: string
    passwordHash: string
    role: string
  }): Promise<{
    id: string
    role: string
    fullName: string
    email: string
  }>
}

export function createUserRepository(prisma: PrismaClient): UserRepository {
  return {
    async findByEmail(email) {
      const u = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      })
      return u
    },

    async findByEmailForLogin(email) {
      return prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          passwordHash: true,
        },
      })
    },

    async findByIdForMe(id) {
      return prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          partnerMembers: {
            where: { isActive: true },
            select: {
              id: true,
              role: true,
              workspaceId: true,
              workspace: {
                select: {
                  id: true,
                  name: true,
                  verificationStatus: true,
                  isActive: true,
                },
              },
            },
          },
          adminCoverage: {
            select: {
              cityPlaceId: true,
              cityPlace: {
                select: { id: true, name: true, slug: true, type: true },
              },
            },
          },
        },
      })
    },

    async findByIdWithRole(id) {
      return prisma.user.findUnique({
        where: { id, isActive: true },
        select: { id: true, role: true },
      })
    },

    async create(data) {
      return prisma.user.create({
        data: {
          fullName: data.fullName,
          email: data.email,
          passwordHash: data.passwordHash,
          role: data.role as
            | 'GUARDIAN'
            | 'PARTNER_MEMBER'
            | 'ADMIN'
            | 'SUPER_ADMIN',
        },
        select: { id: true, role: true, fullName: true, email: true },
      })
    },
  }
}
