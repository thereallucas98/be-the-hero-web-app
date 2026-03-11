import type { UserRepository } from '../../repositories/user.repository'

export interface UpdateMeInput {
  userId: string
  fullName?: string
  phone?: string
}

export type UpdateMeResult = {
  success: true
  data: { fullName: string; phone: string | null }
}

export async function updateMe(
  userRepo: UserRepository,
  input: UpdateMeInput,
): Promise<UpdateMeResult> {
  const data = await userRepo.updateProfile(input.userId, {
    fullName: input.fullName,
    phone: input.phone,
  })
  return { success: true, data }
}
