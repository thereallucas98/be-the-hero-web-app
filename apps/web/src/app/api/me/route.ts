import { NextResponse } from 'next/server'
import { getAccessTokenFromCookie, verifyAccessToken } from '~/lib/session'
import { userRepository } from '~/server/repositories'
import { getMe } from '~/server/use-cases'

export async function GET(req: Request) {
  const token = getAccessTokenFromCookie(req.headers.get('cookie'))
  if (!token) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 })
  }

  let payload: { sub: string }
  try {
    payload = verifyAccessToken(token)
  } catch {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 })
  }

  const result = await getMe(userRepository, payload.sub)

  if (!result.success) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 })
  }

  return NextResponse.json(
    { user: result.user, context: result.context },
    { status: 200 },
  )
}
