import type {
  PublicPetDetailItem,
  PetRepository,
} from '../../repositories/pet.repository'

export type GetPetDetailResult =
  | { success: true; pet: PublicPetDetailItem }
  | { success: false; code: 'NOT_FOUND' }

export async function getPetDetail(
  petRepo: PetRepository,
  petId: string,
): Promise<GetPetDetailResult> {
  const pet = await petRepo.findByIdPublic(petId)
  if (!pet) {
    return { success: false, code: 'NOT_FOUND' }
  }
  return { success: true, pet }
}
