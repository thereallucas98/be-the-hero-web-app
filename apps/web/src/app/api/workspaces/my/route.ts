import { NextResponse } from 'next/server'
import { prisma } from '~/lib/db'
import { getPrincipal } from '~/lib/get-principal'

export async function GET(req: Request) {
  const principal = await getPrincipal(req)
  if (!principal) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 })
  }

  // No MVP, qualquer usuário logado pode listar suas memberships.
  // (PARTNER_MEMBER vai ter workspaces; outros roles normalmente não)
  const memberships = await prisma.partnerMember.findMany({
    where: {
      userId: principal.userId,
      isActive: true,
    },
    select: {
      id: true,
      role: true,
      workspace: {
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          verificationStatus: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          locations: {
            where: { isPrimary: true },
            take: 1,
            select: {
              id: true,
              isPrimary: true,
              lat: true,
              lng: true,
              addressLine: true,
              neighborhood: true,
              zipCode: true,
              cityPlace: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  type: true,
                  parent: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                      type: true,
                      parent: {
                        select: {
                          id: true,
                          name: true,
                          code: true,
                          type: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          cityCoverage: {
            select: {
              cityPlace: {
                select: { id: true, name: true, slug: true, type: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(
    {
      memberships: memberships.map((m) => {
        const primaryLocation = m.workspace.locations[0] ?? null

        return {
          member: {
            id: m.id,
            role: m.role,
          },
          workspace: {
            id: m.workspace.id,
            name: m.workspace.name,
            type: m.workspace.type,
            description: m.workspace.description,
            verificationStatus: m.workspace.verificationStatus,
            isActive: m.workspace.isActive,
            createdAt: m.workspace.createdAt,
            updatedAt: m.workspace.updatedAt,
          },
          primaryLocation,
          cityCoverage: m.workspace.cityCoverage.map((c) => c.cityPlace),
        }
      }),
    },
    { status: 200 },
  )
}
