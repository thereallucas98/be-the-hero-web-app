import type { Role } from '@bethehero/auth'
import bcrypt from 'bcryptjs'
import { createHash, randomBytes } from 'crypto'
import jwt from 'jsonwebtoken'

export function hashPassword(password: string) {
  // 12 é um bom baseline de custo
  return bcrypt.hash(password, 12)
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export type JwtPayload = {
  sub: string // userId
  role: Role
}

export function signAccessToken(payload: JwtPayload) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('Missing JWT_SECRET')
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export function generateToken(): { raw: string; hashed: string } {
  const raw = randomBytes(32).toString('hex')
  const hashed = createHash('sha256').update(raw).digest('hex')
  return { raw, hashed }
}

export function signEmailVerifyToken(userId: string): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('Missing JWT_SECRET')
  return jwt.sign({ sub: userId, purpose: 'email_verify' }, secret, {
    expiresIn: '24h',
  })
}

export function verifyEmailVerifyToken(
  token: string,
): { userId: string } | null {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) return null
    const payload = jwt.verify(token, secret) as {
      sub: string
      purpose: string
    }
    if (payload.purpose !== 'email_verify') return null
    return { userId: payload.sub }
  } catch {
    return null
  }
}
