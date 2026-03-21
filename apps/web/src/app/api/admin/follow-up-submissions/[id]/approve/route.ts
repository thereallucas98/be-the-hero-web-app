import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import { followUpRepository } from '~/server/repositories'
import { approveFollowUpSubmission } from '~/server/use-cases'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const principal = await getPrincipal(req)

  const { id } = await params

  const idParsed = z.uuid().safeParse(id)
  if (!idParsed.success) {
    return NextResponse.json(
      { message: 'Invalid submission id', details: idParsed.error.issues },
      { status: 400 },
    )
  }

  const result = await approveFollowUpSubmission(
    followUpRepository,
    principal,
    {
      submissionId: idParsed.data,
    },
  )

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      ALREADY_REVIEWED: 409,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      FORBIDDEN: 'Forbidden',
      NOT_FOUND: 'Submission not found',
      ALREADY_REVIEWED: 'Submission has already been reviewed',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.submission, { status: 200 })
}
