import type { PetRepository } from '../../repositories/pet.repository'

export interface TrackPetEventInput {
  petId: string
  type: string
}

export type TrackPetEventResult =
  | { success: true }
  | { success: false; code: 'NOT_FOUND' }

export async function trackPetEvent(
  petRepo: PetRepository,
  input: TrackPetEventInput,
): Promise<TrackPetEventResult> {
  const pet = await petRepo.findByIdForTracking(input.petId)
  if (!pet || pet.status !== 'APPROVED') {
    return { success: false, code: 'NOT_FOUND' }
  }

  await petRepo.trackEvent(pet.id, pet.workspaceId, input.type)

  return { success: true }
}
