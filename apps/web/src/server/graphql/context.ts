import { prisma } from '~/lib/db'
import { getAccessTokenFromCookie, verifyAccessToken } from '~/lib/session'
import {
  adoptionInterestRepository,
  adoptionRepository,
  followUpRepository,
  userRepository,
} from '~/server/repositories'

export interface Principal {
  userId: string
  email: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
  adminCities: string[]
}

export interface GraphQLContext {
  principal: Principal | null
  repos: {
    userRepo: typeof userRepository
    interestRepo: typeof adoptionInterestRepository
    adoptionRepo: typeof adoptionRepository
    followUpRepo: typeof followUpRepository
  }
}

async function resolvePrincipal(request: Request): Promise<Principal | null> {
  const cookieHeader = request.headers.get('cookie')
  const token = getAccessTokenFromCookie(cookieHeader)
  if (!token) return null

  try {
    const payload = verifyAccessToken(token)

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
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
      email: user.email,
      role: user.role as string,
      memberships: user.partnerMembers,
      adminCities: user.adminCoverage.map((c) => c.cityPlaceId),
    }
  } catch {
    return null
  }
}

export async function createGraphQLContext(
  request: Request,
): Promise<GraphQLContext> {
  const principal = await resolvePrincipal(request)

  return {
    principal,
    repos: {
      userRepo: userRepository,
      interestRepo: adoptionInterestRepository,
      adoptionRepo: adoptionRepository,
      followUpRepo: followUpRepository,
    },
  }
}
