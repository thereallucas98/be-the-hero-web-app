import type {
  ListPublicPetsInput,
  ListPublicPetsResult,
  PetRepository,
} from '../../repositories/pet.repository'

export type ListPetsInput = ListPublicPetsInput
export type ListPetsResult = ListPublicPetsResult

export async function listPets(
  petRepo: PetRepository,
  input: ListPetsInput,
): Promise<ListPetsResult> {
  return petRepo.listPublicPets(input)
}
