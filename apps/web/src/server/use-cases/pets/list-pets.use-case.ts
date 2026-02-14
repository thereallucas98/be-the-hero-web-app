import type {
  ListPublicPetsInput,
  ListPublicPetsResult,
  PetRepository,
} from '../../repositories/pet.repository'

export type ListPetsResult = ListPublicPetsResult

export async function listPets(
  petRepo: PetRepository,
  input: ListPublicPetsInput,
): Promise<ListPetsResult> {
  return petRepo.listPublicPets(input)
}
