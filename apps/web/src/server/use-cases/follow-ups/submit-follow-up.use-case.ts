import type {
  FollowUpRepository,
  SubmissionItem,
} from '../../repositories/follow-up.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
  adminCities: string[]
}

export interface SubmitFollowUpInput {
  followUpId: string
  photoUrl: string
  storagePath: string
  mimeType: string
  fileSize: number
  message?: string
}

export type SubmitFollowUpResult =
  | { success: true; submission: SubmissionItem }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'NOT_FOUND'
        | 'FORBIDDEN'
        | 'ALREADY_APPROVED'
        | 'NOT_YET_DUE'
    }

export async function submitFollowUp(
  followUpRepo: FollowUpRepository,
  principal: Principal | null,
  input: SubmitFollowUpInput,
): Promise<SubmitFollowUpResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const followUp = await followUpRepo.findByIdWithAdoption(input.followUpId)
  if (!followUp) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (principal.userId !== followUp.adoption.guardianUserId) {
    return { success: false, code: 'FORBIDDEN' }
  }

  if (followUp.status === 'APPROVED') {
    return { success: false, code: 'ALREADY_APPROVED' }
  }

  if (followUp.scheduledAt > new Date()) {
    return { success: false, code: 'NOT_YET_DUE' }
  }

  const submission = await followUpRepo.createSubmission(
    input.followUpId,
    principal.userId,
    {
      photoUrl: input.photoUrl,
      storagePath: input.storagePath,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      message: input.message,
    },
  )

  return { success: true, submission }
}
