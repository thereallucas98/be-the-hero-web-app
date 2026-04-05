import type {
  PetRepository,
  WorkspacePetDetailItem,
} from '../../repositories/pet.repository'

export type GetWorkspacePetDetailResult =
  | { success: true; pet: WorkspacePetDetailItem }
  | { success: false; code: 'NOT_FOUND' }

export async function getWorkspacePetDetail(
  petRepo: PetRepository,
  input: { petId: string; workspaceId: string },
): Promise<GetWorkspacePetDetailResult> {
  const pet = await petRepo.findByIdForWorkspace(input.petId, input.workspaceId)
  if (!pet) return { success: false, code: 'NOT_FOUND' }
  return { success: true, pet }
}
