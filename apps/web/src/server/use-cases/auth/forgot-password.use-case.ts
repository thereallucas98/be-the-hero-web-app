import { generateToken } from '~/lib/auth'
import type { UserRepository } from '../../repositories/user.repository'

export interface ForgotPasswordInput {
  email: string
}

export type ForgotPasswordResult = { success: true }

export async function forgotPassword(
  userRepo: UserRepository,
  input: ForgotPasswordInput,
): Promise<ForgotPasswordResult> {
  const user = await userRepo.findByEmail(input.email)

  if (user) {
    const { raw, hashed } = generateToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await userRepo.setResetToken(user.id, hashed, expiresAt)
    // TODO: send email with reset link containing raw token
    console.log('[forgot-password] reset token:', raw)
  }

  // Always succeed — never reveal whether email exists
  return { success: true }
}
