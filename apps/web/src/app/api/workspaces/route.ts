import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '~/lib/db'
import { getPrincipal } from '~/lib/get-principal'

const CreateWorkspaceSchema = z.object({
  name: z.string().min(3),
  type: z.enum(['ONG', 'CLINIC', 'PETSHOP', 'INDEPENDENT']),
  description: z.string().min(10),

  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  emailPublic: z.email().optional(),

  cityPlaceId: z.string(),
  lat: z.number(),
  lng: z.number(),
  addressLine: z.string().optional(),
  neighborhood: z.string().optional(),
  zipCode: z.string().optional(),
})

export async function POST(req: Request) {
  const principal = await getPrincipal(req)
  if (!principal) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 })
  }

  // MVP: apenas PARTNER_MEMBER pode criar workspace
  if (principal.role !== 'PARTNER_MEMBER') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = CreateWorkspaceSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const data = parsed.data

  // Validar se cityPlaceId é CITY
  const city = await prisma.geoPlace.findUnique({
    where: { id: data.cityPlaceId },
    select: { id: true, type: true },
  })

  if (!city || city.type !== 'CITY') {
    return NextResponse.json(
      { message: 'Invalid cityPlaceId' },
      { status: 400 },
    )
  }

  const result = await prisma.$transaction(async (tx) => {
    const workspace = await tx.partnerWorkspace.create({
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
        phone: data.phone,
        whatsapp: data.whatsapp,
        emailPublic: data.emailPublic,
      },
    })

    await tx.partnerWorkspaceLocation.create({
      data: {
        workspaceId: workspace.id,
        cityPlaceId: data.cityPlaceId,
        lat: data.lat,
        lng: data.lng,
        addressLine: data.addressLine,
        neighborhood: data.neighborhood,
        zipCode: data.zipCode,
        isPrimary: true,
      },
    })

    await tx.partnerCityCoverage.create({
      data: {
        workspaceId: workspace.id,
        cityPlaceId: data.cityPlaceId,
      },
    })

    await tx.partnerMember.create({
      data: {
        workspaceId: workspace.id,
        userId: principal.userId,
        role: 'OWNER',
      },
    })

    return workspace
  })

  return NextResponse.json(
    {
      workspace: {
        id: result.id,
        name: result.name,
        verificationStatus: result.verificationStatus,
      },
    },
    { status: 201 },
  )
}
