import { cookies } from 'next/headers'
import { prisma } from '~/lib/db'
import { verifyAccessToken } from '~/lib/session'

/**
 * Reads the auth cookie from Next.js headers — for use in Server Components and layouts.
 * API routes should continue using getPrincipal(req) from ~/lib/get-principal.
 */
export async function getServerPrincipal() {
  const cookieStore = await cookies()
  const token = cookieStore.get('bth_access')?.value
  if (!token) return null

  try {
    const payload = verifyAccessToken(token)

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        role: true,
        isActive: true,
        partnerMembers: {
          where: { isActive: true },
          select: { workspaceId: true, role: true },
        },
        adminCoverage: {
          select: { cityPlaceId: true },
        },
      },
    })

    if (!user || !user.isActive) return null

    return {
      userId: user.id,
      role: user.role as string,
      memberships: user.partnerMembers,
      adminCities: user.adminCoverage.map((c) => c.cityPlaceId),
    }
  } catch {
    return null
  }
}
