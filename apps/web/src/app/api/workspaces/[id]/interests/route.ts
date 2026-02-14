import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import {
  adoptionInterestRepository,
  workspaceRepository,
} from '~/server/repositories'
import { ListWorkspaceInterestsQuerySchema } from '~/server/schemas/workspace.schema'
import { listWorkspaceInterests } from '~/server/use-cases'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const principal = await getPrincipal(req)

  const { id: workspaceId } = await params

  const workspaceIdParsed = z.uuid().safeParse(workspaceId)
  if (!workspaceIdParsed.success) {
    return NextResponse.json(
      {
        message: 'Invalid workspace id',
        details: workspaceIdParsed.error.issues,
      },
      { status: 400 },
    )
  }

  const { searchParams } = new URL(req.url)
  const query = Object.fromEntries(searchParams.entries())
  const parsed = ListWorkspaceInterestsQuerySchema.safeParse(query)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid query', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await listWorkspaceInterests(
    workspaceRepository,
    adoptionInterestRepository,
    principal,
    {
      workspaceId: workspaceIdParsed.data,
      page: parsed.data.page,
      perPage: parsed.data.perPage,
    },
  )

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      NOT_FOUND: 'Workspace not found',
      FORBIDDEN: 'Forbidden',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.data, { status: 200 })
}
