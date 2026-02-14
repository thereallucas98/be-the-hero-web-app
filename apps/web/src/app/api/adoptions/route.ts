import { NextResponse } from 'next/server'
import { getPrincipal } from '~/lib/get-principal'
import {
  adoptionRepository,
  petRepository,
  userRepository,
  workspaceRepository,
} from '~/server/repositories'
import { RegisterAdoptionSchema } from '~/server/schemas/adoption.schema'
import { registerAdoption } from '~/server/use-cases'

export async function POST(req: Request) {
  const principal = await getPrincipal(req)

  const body = await req.json().catch(() => null)
  const parsed = RegisterAdoptionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const adoptedAt = parsed.data.adoptedAt
    ? new Date(parsed.data.adoptedAt)
    : undefined

  const result = await registerAdoption(
    petRepository,
    userRepository,
    workspaceRepository,
    adoptionRepository,
    principal,
    {
      petId: parsed.data.petId,
      guardianUserId: parsed.data.guardianUserId,
      adoptedAt,
      notes: parsed.data.notes,
    },
  )

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      PET_NOT_APPROVED: 409,
      PET_ALREADY_ADOPTED: 409,
      WORKSPACE_BLOCKED: 403,
      GUARDIAN_NOT_FOUND: 404,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      FORBIDDEN: 'Forbidden',
      NOT_FOUND: 'Pet or workspace not found',
      PET_NOT_APPROVED: 'Pet must be approved',
      PET_ALREADY_ADOPTED: 'Pet has already been adopted',
      WORKSPACE_BLOCKED: 'Workspace is inactive or not approved',
      GUARDIAN_NOT_FOUND: 'Guardian user not found',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.adoption, { status: 201 })
}
