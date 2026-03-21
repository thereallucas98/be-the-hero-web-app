import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import { campaignDocumentRepository } from '~/server/repositories'
import { removeCampaignDocument } from '~/server/use-cases'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; docId: string }> },
) {
  const principal = await getPrincipal(req)
  const { id, docId } = await params

  const idParsed = z.uuid().safeParse(id)
  if (!idParsed.success) {
    return NextResponse.json(
      { message: 'Invalid campaign id', details: idParsed.error.issues },
      { status: 400 },
    )
  }

  const docIdParsed = z.uuid().safeParse(docId)
  if (!docIdParsed.success) {
    return NextResponse.json(
      { message: 'Invalid document id', details: docIdParsed.error.issues },
      { status: 400 },
    )
  }

  const result = await removeCampaignDocument(
    campaignDocumentRepository,
    principal,
    docIdParsed.data,
  )

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      CAMPAIGN_NOT_EDITABLE: 409,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      FORBIDDEN: 'Forbidden',
      NOT_FOUND: 'Document not found',
      CAMPAIGN_NOT_EDITABLE: 'Campaign cannot be edited in its current status',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return new NextResponse(null, { status: 204 })
}
