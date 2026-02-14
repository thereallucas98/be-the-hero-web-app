import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import {
  auditRepository,
  geoPlaceRepository,
  workspaceRepository,
} from '~/server/repositories'
import { UpdateWorkspaceLocationSchema } from '~/server/schemas/workspace.schema'
import { updateWorkspaceLocation } from '~/server/use-cases'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const principal = await getPrincipal(req)

  const { id } = await params

  const idParsed = z.uuid().safeParse(id)
  if (!idParsed.success) {
    return NextResponse.json(
      { message: 'Invalid workspace id', details: idParsed.error.issues },
      { status: 400 },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = UpdateWorkspaceLocationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await updateWorkspaceLocation(
    workspaceRepository,
    geoPlaceRepository,
    auditRepository,
    principal,
    { id: idParsed.data, data: parsed.data },
  )

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
      INVALID_CITY: 400,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      NOT_FOUND: 'Workspace not found',
      FORBIDDEN: 'Forbidden',
      INVALID_CITY: 'Invalid or non-CITY cityPlaceId',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.workspace, { status: 200 })
}
