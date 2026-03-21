import { NextResponse } from 'next/server'
import { getPrincipal } from '~/lib/get-principal'
import { followUpRepository } from '~/server/repositories'
import { ListGuardianAdoptionsQuerySchema } from '~/server/schemas/follow-up.schema'
import { listGuardianAdoptions } from '~/server/use-cases'

export async function GET(req: Request) {
  const principal = await getPrincipal(req)

  const { searchParams } = new URL(req.url)
  const rawQuery = {
    page: searchParams.get('page') ?? undefined,
    perPage: searchParams.get('perPage') ?? undefined,
  }

  const parsed = ListGuardianAdoptionsQuerySchema.safeParse(rawQuery)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid query', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await listGuardianAdoptions(
    followUpRepository,
    principal,
    parsed.data,
  )

  if (!result.success) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 })
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
