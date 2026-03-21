import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import { donationRepository } from '~/server/repositories'
import { RejectDonationSchema } from '~/server/schemas/donation.schema'
import { rejectDonation } from '~/server/use-cases'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const principal = await getPrincipal(req)
  const { id } = await params

  const idParsed = z.uuid().safeParse(id)
  if (!idParsed.success) {
    return NextResponse.json(
      { message: 'Invalid donation id', details: idParsed.error.issues },
      { status: 400 },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = RejectDonationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await rejectDonation(donationRepository, principal, {
    donationId: idParsed.data,
    reviewNote: parsed.data.reviewNote,
  })

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      DONATION_NOT_REVIEWABLE: 409,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      FORBIDDEN: 'Forbidden',
      NOT_FOUND: 'Donation not found',
      DONATION_NOT_REVIEWABLE: 'Donation is not in PENDING_REVIEW status',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.donation, { status: 200 })
}
