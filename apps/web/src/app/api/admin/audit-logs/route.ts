import { NextResponse } from 'next/server'
import { getPrincipal } from '~/lib/get-principal'
import { auditRepository } from '~/server/repositories'
import { ListAuditLogsQuerySchema } from '~/server/schemas/admin.schema'
import { listAuditLogs } from '~/server/use-cases'

export async function GET(req: Request) {
  const principal = await getPrincipal(req)
  const { searchParams } = new URL(req.url)

  const parsed = ListAuditLogsQuerySchema.safeParse({
    actorId: searchParams.get('actorId') ?? undefined,
    entityType: searchParams.get('entityType') ?? undefined,
    action: searchParams.get('action') ?? undefined,
    dateFrom: searchParams.get('dateFrom') ?? undefined,
    dateTo: searchParams.get('dateTo') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    perPage: searchParams.get('perPage') ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid query', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await listAuditLogs(auditRepository, principal, parsed.data)

  if (!result.success) {
    const statusMap = { UNAUTHENTICATED: 401, FORBIDDEN: 403 } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      FORBIDDEN: 'Forbidden',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.data, { status: 200 })
}
