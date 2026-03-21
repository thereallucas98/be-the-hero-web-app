import { NextResponse } from 'next/server'
import { getPrincipal } from '~/lib/get-principal'
import { followUpRepository } from '~/server/repositories'
import { ListFollowUpSubmissionsQuerySchema } from '~/server/schemas/follow-up.schema'
import { listFollowUpSubmissionsAdmin } from '~/server/use-cases'

export async function GET(req: Request) {
  const principal = await getPrincipal(req)

  const { searchParams } = new URL(req.url)
  const rawQuery = {
    status: searchParams.get('status') ?? undefined,
    workspaceId: searchParams.get('workspaceId') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    perPage: searchParams.get('perPage') ?? undefined,
  }

  const parsed = ListFollowUpSubmissionsQuerySchema.safeParse(rawQuery)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid query', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await listFollowUpSubmissionsAdmin(
    followUpRepository,
    principal,
    parsed.data,
  )

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      FORBIDDEN: 403,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      FORBIDDEN: 'Forbidden',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(
    {
      items: result.items,
      total: result.total,
      page: result.page,
      perPage: result.perPage,
    },
    { status: 200 },
  )
}
