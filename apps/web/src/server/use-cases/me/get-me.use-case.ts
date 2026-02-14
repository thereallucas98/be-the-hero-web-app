import type { UserRepository } from '../../repositories/user.repository'

export type GetMeResult =
  | {
      success: true
      user: {
        id: string
        fullName: string
        email: string
        role: string
        emailVerified: boolean
      }
      context: {
        memberships: Array<{
          workspaceId: string
          role: string
          workspace: {
            id: string
            name: string
            verificationStatus: string
            isActive: boolean
          }
        }>
        adminCities: Array<{
          id: string
          name: string
          slug: string
          type: string
        }>
      }
    }
  | { success: false; code: 'UNAUTHENTICATED' }

export async function getMe(
  userRepo: UserRepository,
  userId: string,
): Promise<GetMeResult> {
  const user = await userRepo.findByIdForMe(userId)

  if (!user || !user.isActive) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  return {
    success: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    },
    context: {
      memberships: user.partnerMembers.map((m) => ({
        workspaceId: m.workspaceId,
        role: m.role,
        workspace: m.workspace,
      })),
      adminCities: user.adminCoverage.map((c) => c.cityPlace),
    },
  }
}
