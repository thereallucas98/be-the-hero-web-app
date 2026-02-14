import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Template: add your auth and route protection logic here
export function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
