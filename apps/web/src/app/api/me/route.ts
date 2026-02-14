import { NextResponse } from 'next/server'
import { prisma } from '~/lib/db'
import { getAccessTokenFromCookie, verifyAccessToken } from '~/lib/session'

export async function GET(req: Request) {
  const token = getAccessTokenFromCookie(req.headers.get('cookie'))

  if (!token) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 })
  }

  let payload: { sub: string; role: string }
  try {
    payload = verifyAccessToken(token)
  } catch {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      partnerMembers: {
        where: { isActive: true },
        select: {
          id: true,
          role: true,
          workspaceId: true,
          workspace: {
            select: {
              id: true,
              name: true,
              verificationStatus: true,
              isActive: true,
            },
          },
        },
      },
      adminCoverage: {
        select: {
          cityPlaceId: true,
          cityPlace: {
            select: { id: true, name: true, slug: true, type: true },
          },
        },
      },
    },
  })

  if (!user || !user.isActive) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 })
  }

  return NextResponse.json(
    {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      context: {
        memberships: user.partnerMembers.map((m) => ({
          workspaceId: m.workspaceId,
          role: m.role,
          workspace: m.workspace,
        })),
        adminCities: user.adminCoverage.map((c) => c.cityPlace),
      },
    },
    { status: 200 },
  )
}
