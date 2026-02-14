import type { WorkspaceRepository } from '../../repositories/workspace.repository'

export type ListMyWorkspacesResult =
  | {
      success: true
      memberships: Array<{
        member: { id: string; role: string }
        workspace: {
          id: string
          name: string
          type: string
          description: string
          verificationStatus: string
          isActive: boolean
          createdAt: Date
          updatedAt: Date
        }
        primaryLocation: {
          id: string
          isPrimary: boolean
          lat: number
          lng: number
          addressLine: string | null
          neighborhood: string | null
          zipCode: string | null
          cityPlace: unknown
        } | null
        cityCoverage: Array<{
          id: string
          name: string
          slug: string
          type: string
        }>
      }>
    }
  | { success: false; code: 'UNAUTHENTICATED' }

export async function listMyWorkspaces(
  workspaceRepo: WorkspaceRepository,
  principal: { userId: string } | null,
): Promise<ListMyWorkspacesResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const memberships = await workspaceRepo.findMembershipsByUserId(
    principal.userId,
  )

  return {
    success: true,
    memberships: memberships.map((m) => {
      const primaryLocation = m.workspace.locations[0] ?? null
      return {
        member: { id: m.id, role: m.role },
        workspace: {
          id: m.workspace.id,
          name: m.workspace.name,
          type: m.workspace.type,
          description: m.workspace.description,
          verificationStatus: m.workspace.verificationStatus,
          isActive: m.workspace.isActive,
          createdAt: m.workspace.createdAt,
          updatedAt: m.workspace.updatedAt,
        },
        primaryLocation,
        cityCoverage: m.workspace.cityCoverage.map((c) => c.cityPlace),
      }
    }),
  }
}
