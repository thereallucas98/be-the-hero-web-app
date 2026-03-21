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

export interface RejectFollowUpSubmissionInput {
  submissionId: string
  reviewNote: string
}

export type RejectFollowUpSubmissionResult =
  | { success: true; submission: SubmissionItem }
  | {
      success: false
      code: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'ALREADY_REVIEWED'
    }

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

export async function rejectFollowUpSubmission(
  followUpRepo: FollowUpRepository,
  principal: Principal | null,
  input: RejectFollowUpSubmissionInput,
): Promise<RejectFollowUpSubmissionResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const isAdmin = ADMIN_ROLES.includes(
    principal.role as 'ADMIN' | 'SUPER_ADMIN',
  )
  if (!isAdmin) {
    return { success: false, code: 'FORBIDDEN' }
  }

  const submission = await followUpRepo.findSubmissionById(input.submissionId)
  if (!submission) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (submission.status !== 'SUBMITTED') {
    return { success: false, code: 'ALREADY_REVIEWED' }
  }

  const updated = await followUpRepo.rejectSubmission(
    input.submissionId,
    principal.userId,
    input.reviewNote,
  )
  return { success: true, submission: updated }
}
