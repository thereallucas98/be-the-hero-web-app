import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import {
  adoptionInterestRepository,
  adoptionRepository,
  petRepository,
  workspaceRepository,
} from '~/server/repositories'
import { ConvertInterestSchema } from '~/server/schemas/adoption-interest.schema'
import { convertInterestToAdoption } from '~/server/use-cases'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; interestId: string }> },
) {
  const principal = await getPrincipal(req)
  const { id, interestId } = await params

  const workspaceIdParsed = z.uuid().safeParse(id)
  if (!workspaceIdParsed.success) {
    return NextResponse.json(
      {
        message: 'Invalid workspace id',
        details: workspaceIdParsed.error.issues,
      },
      { status: 400 },
    )
  }

  const interestIdParsed = z.uuid().safeParse(interestId)
  if (!interestIdParsed.success) {
    return NextResponse.json(
      {
        message: 'Invalid interest id',
        details: interestIdParsed.error.issues,
      },
      { status: 400 },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = ConvertInterestSchema.safeParse(body ?? {})
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await convertInterestToAdoption(
    adoptionInterestRepository,
    petRepository,
    workspaceRepository,
    adoptionRepository,
    principal,
    {
      workspaceId: workspaceIdParsed.data,
      interestId: interestIdParsed.data,
      notes: parsed.data.notes,
      adoptedAt: parsed.data.adoptedAt,
    },
  )

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      PET_ALREADY_ADOPTED: 409,
      PET_NOT_APPROVED: 409,
      WORKSPACE_BLOCKED: 409,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      FORBIDDEN: 'Forbidden',
      NOT_FOUND: 'Interest not found',
      PET_ALREADY_ADOPTED: 'Pet has already been adopted',
      PET_NOT_APPROVED: 'Pet must be approved',
      WORKSPACE_BLOCKED: 'Workspace is inactive or not approved',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.adoption, { status: 201 })
}
