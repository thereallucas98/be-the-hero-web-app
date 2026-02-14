import type { Role } from '@bethehero/auth'
import bcrypt from 'bcryptjs'
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
