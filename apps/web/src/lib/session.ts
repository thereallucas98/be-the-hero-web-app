import jwt from 'jsonwebtoken'
import type { JwtPayload } from '~/lib/auth'

export function getAccessTokenFromCookie(cookieHeader: string | null) {
  if (!cookieHeader) return null

  // cookie header: "a=b; bth_access=xxx; c=d"
  const parts = cookieHeader.split(';').map((p) => p.trim())
  const found = parts.find((p) => p.startsWith('bth_access='))
  if (!found) return null

  const value = found.slice('bth_access='.length)
  return value || null
}

export function verifyAccessToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('Missing JWT_SECRET')

  const decoded = jwt.verify(token, secret) as JwtPayload
  return decoded
}
