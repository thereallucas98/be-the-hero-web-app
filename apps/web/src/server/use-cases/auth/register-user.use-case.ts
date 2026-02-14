import { PUBLIC_REGISTRABLE_ROLES } from '@bethehero/auth'
import { hashPassword, signAccessToken } from '~/lib/auth'
import type { UserRepository } from '../../repositories/user.repository'

export interface RegisterUserInput {
  fullName: string
  email: string
  password: string
  role: string
}

export type RegisterUserResult =
  | {
      success: true
      user: { id: string; fullName: string; email: string; role: string }
      token: string
    }
  | { success: false; code: 'EMAIL_IN_USE' | 'FORBIDDEN_ROLE' }

export async function registerUser(
  userRepo: UserRepository,
  input: RegisterUserInput,
): Promise<RegisterUserResult> {
  if (
    !PUBLIC_REGISTRABLE_ROLES.includes(
      input.role as 'GUARDIAN' | 'PARTNER_MEMBER',
    )
  ) {
    return { success: false, code: 'FORBIDDEN_ROLE' }
  }

  const existing = await userRepo.findByEmail(input.email)
  if (existing) {
    return { success: false, code: 'EMAIL_IN_USE' }
  }

  const passwordHash = await hashPassword(input.password)
  const user = await userRepo.create({
    fullName: input.fullName,
    email: input.email,
    passwordHash,
    role: input.role,
  })

  const token = signAccessToken({
    sub: user.id,
    role: user.role as 'GUARDIAN' | 'PARTNER_MEMBER',
  })

  return {
    success: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
    token,
  }
}
