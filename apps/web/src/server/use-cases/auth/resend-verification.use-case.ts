import { signEmailVerifyToken } from '~/lib/auth'
import type { UserRepository } from '../../repositories/user.repository'

export interface ResendVerificationInput {
  userId: string
}

export type ResendVerificationResult =
  | { success: true }
  | { success: false; code: 'ALREADY_VERIFIED' }

export async function resendVerification(
  userRepo: UserRepository,
  input: ResendVerificationInput,
): Promise<ResendVerificationResult> {
  const user = await userRepo.findEmailVerifiedById(input.userId)
  if (!user) {
    return { success: false, code: 'ALREADY_VERIFIED' }
  }

  if (user.emailVerified) {
    return { success: false, code: 'ALREADY_VERIFIED' }
  }

  const token = signEmailVerifyToken(user.id)
  // TODO: send email with verification link containing token
  console.log('[resend-verification] verify token:', token)

  return { success: true }
}
