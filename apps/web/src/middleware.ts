import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from '~/lib/session'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('bth_access')?.value

  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const payload = verifyAccessToken(token)

    if (payload.role !== 'GUARDIAN') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  } catch {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/guardian/:path*'],
}
