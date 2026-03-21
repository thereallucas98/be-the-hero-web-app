import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import { followUpRepository } from '~/server/repositories'
import { SubmitFollowUpSchema } from '~/server/schemas/follow-up.schema'
import { submitFollowUp } from '~/server/use-cases'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const principal = await getPrincipal(req)

  const { id } = await params

  const idParsed = z.uuid().safeParse(id)
  if (!idParsed.success) {
    return NextResponse.json(
      { message: 'Invalid follow-up id', details: idParsed.error.issues },
      { status: 400 },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = SubmitFollowUpSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await submitFollowUp(followUpRepository, principal, {
    followUpId: idParsed.data,
    ...parsed.data,
  })

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
      ALREADY_APPROVED: 409,
      NOT_YET_DUE: 422,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      NOT_FOUND: 'Follow-up not found',
      FORBIDDEN: 'Forbidden',
      ALREADY_APPROVED: 'Follow-up is already approved',
      NOT_YET_DUE: 'Follow-up is not yet due',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.submission, { status: 201 })
}
