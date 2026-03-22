import { NextResponse } from 'next/server'
import { getPrincipal } from '~/lib/get-principal'
import { metricsRepository } from '~/server/repositories'
import { PlatformMetricsQuerySchema } from '~/server/schemas/metrics.schema'
import { getPlatformMetrics } from '~/server/use-cases'

export async function GET(req: Request) {
  const principal = await getPrincipal(req)
  const { searchParams } = new URL(req.url)

  const parsed = PlatformMetricsQuerySchema.safeParse({
    cityId: searchParams.get('cityId') ?? undefined,
    dateFrom: searchParams.get('dateFrom') ?? undefined,
    dateTo: searchParams.get('dateTo') ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid query', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await getPlatformMetrics(
    metricsRepository,
    principal,
    parsed.data,
  )

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

  return NextResponse.json(result.metrics, { status: 200 })
}
