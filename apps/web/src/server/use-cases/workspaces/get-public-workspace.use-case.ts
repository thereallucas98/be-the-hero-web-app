import type {
  PublicWorkspaceItem,
  WorkspaceRepository,
} from '../../repositories/workspace.repository'

export type GetPublicWorkspaceResult =
  | { success: true; workspace: PublicWorkspaceItem }
  | { success: false; code: 'NOT_FOUND' }

export async function getPublicWorkspace(
  workspaceRepo: WorkspaceRepository,
  workspaceId: string,
): Promise<GetPublicWorkspaceResult> {
  const workspace = await workspaceRepo.findByIdPublic(workspaceId)
  if (!workspace) return { success: false, code: 'NOT_FOUND' }
  return { success: true, workspace }
}
