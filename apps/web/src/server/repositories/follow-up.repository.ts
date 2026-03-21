import type { PrismaClient } from '~/generated/prisma/client'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FollowUpCurrentSubmissionItem {
  id: string
  status: string
  submittedAt: Date
  photoUrl: string
  message: string | null
  reviewNote: string | null
}

export interface FollowUpListItem {
  id: string
  type: string
  scheduledAt: Date
  status: string
  currentSubmission: FollowUpCurrentSubmissionItem | null
}

export interface FollowUpWithAdoptionItem {
  id: string
  type: string
  scheduledAt: Date
  status: string
  adoption: {
    id: string
    guardianUserId: string
    workspaceId: string
  }
}

export interface CreateSubmissionData {
  photoUrl: string
  storagePath: string
  mimeType: string
  fileSize: number
  message?: string
}

export interface SubmissionItem {
  id: string
  followUpId: string
  submittedByUserId: string
  photoUrl: string
  storagePath: string
  mimeType: string
  fileSize: number
  message: string | null
  submittedAt: Date
  status: string
  reviewedAt: Date | null
  reviewedByUserId: string | null
  reviewNote: string | null
}

export interface AdminSubmissionListItem {
  id: string
  status: string
  submittedAt: Date
  photoUrl: string
  message: string | null
  followUp: {
    id: string
    type: string
    scheduledAt: Date
    adoption: {
      id: string
      workspaceId: string
      pet: { id: string; name: string }
    }
  }
}

export interface ListSubmissionsAdminInput {
  status?: string
  workspaceId?: string
  page?: number
  perPage?: number
}

export interface ListSubmissionsAdminResult {
  items: AdminSubmissionListItem[]
  total: number
  page: number
  perPage: number
}

export interface GuardianAdoptionListItem {
  id: string
  adoptedAt: Date
  status: string
  notes: string | null
  pet: {
    id: string
    name: string
    species: string
    coverImage: { url: string } | null
  }
  followUps: Array<{
    id: string
    type: string
    scheduledAt: Date
    status: string
    currentSubmission: { status: string } | null
  }>
}

export interface ListGuardianAdoptionsInput {
  page?: number
  perPage?: number
}

export interface ListGuardianAdoptionsResult {
  items: GuardianAdoptionListItem[]
  total: number
  page: number
  perPage: number
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface FollowUpRepository {
  findByAdoptionId(adoptionId: string): Promise<FollowUpListItem[]>
  findByIdWithAdoption(
    followUpId: string,
  ): Promise<FollowUpWithAdoptionItem | null>
  createSubmission(
    followUpId: string,
    submittedByUserId: string,
    data: CreateSubmissionData,
  ): Promise<SubmissionItem>
  findSubmissionById(submissionId: string): Promise<SubmissionItem | null>
  approveSubmission(
    submissionId: string,
    reviewerUserId: string,
  ): Promise<SubmissionItem>
  rejectSubmission(
    submissionId: string,
    reviewerUserId: string,
    reviewNote: string,
  ): Promise<SubmissionItem>
  listSubmissionsAdmin(
    input: ListSubmissionsAdminInput,
  ): Promise<ListSubmissionsAdminResult>
  findAdoptionsByGuardian(
    guardianUserId: string,
    input: ListGuardianAdoptionsInput,
  ): Promise<ListGuardianAdoptionsResult>
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createFollowUpRepository(
  prisma: PrismaClient,
): FollowUpRepository {
  return {
    async findByAdoptionId(adoptionId) {
      const rows = await prisma.adoptionFollowUp.findMany({
        where: { adoptionId },
        select: {
          id: true,
          type: true,
          scheduledAt: true,
          status: true,
          currentSubmission: {
            select: {
              id: true,
              status: true,
              submittedAt: true,
              photoUrl: true,
              message: true,
              reviewNote: true,
            },
          },
        },
        orderBy: { scheduledAt: 'asc' },
      })
      return rows.map((r) => ({
        id: r.id,
        type: r.type,
        scheduledAt: r.scheduledAt,
        status: r.status,
        currentSubmission: r.currentSubmission
          ? {
              id: r.currentSubmission.id,
              status: r.currentSubmission.status,
              submittedAt: r.currentSubmission.submittedAt,
              photoUrl: r.currentSubmission.photoUrl,
              message: r.currentSubmission.message,
              reviewNote: r.currentSubmission.reviewNote,
            }
          : null,
      }))
    },

    async findByIdWithAdoption(followUpId) {
      const row = await prisma.adoptionFollowUp.findUnique({
        where: { id: followUpId },
        select: {
          id: true,
          type: true,
          scheduledAt: true,
          status: true,
          adoption: {
            select: {
              id: true,
              guardianUserId: true,
              workspaceId: true,
            },
          },
        },
      })
      if (!row) return null
      return {
        id: row.id,
        type: row.type,
        scheduledAt: row.scheduledAt,
        status: row.status,
        adoption: row.adoption,
      }
    },

    async createSubmission(followUpId, submittedByUserId, data) {
      return prisma.$transaction(async (tx) => {
        const submission = await tx.adoptionFollowUpSubmission.create({
          data: {
            followUpId,
            submittedByUserId,
            photoUrl: data.photoUrl,
            storagePath: data.storagePath,
            mimeType: data.mimeType,
            fileSize: data.fileSize,
            message: data.message ?? null,
            status: 'SUBMITTED',
          },
          select: {
            id: true,
            followUpId: true,
            submittedByUserId: true,
            photoUrl: true,
            storagePath: true,
            mimeType: true,
            fileSize: true,
            message: true,
            submittedAt: true,
            status: true,
            reviewedAt: true,
            reviewedByUserId: true,
            reviewNote: true,
          },
        })

        await tx.adoptionFollowUp.update({
          where: { id: followUpId },
          data: {
            status: 'SUBMITTED',
            currentSubmissionId: submission.id,
          },
        })

        return submission
      })
    },

    async findSubmissionById(submissionId) {
      return prisma.adoptionFollowUpSubmission.findUnique({
        where: { id: submissionId },
        select: {
          id: true,
          followUpId: true,
          submittedByUserId: true,
          photoUrl: true,
          storagePath: true,
          mimeType: true,
          fileSize: true,
          message: true,
          submittedAt: true,
          status: true,
          reviewedAt: true,
          reviewedByUserId: true,
          reviewNote: true,
        },
      })
    },

    async approveSubmission(submissionId, reviewerUserId) {
      return prisma.$transaction(async (tx) => {
        const submission = await tx.adoptionFollowUpSubmission.update({
          where: { id: submissionId },
          data: {
            status: 'APPROVED',
            reviewedAt: new Date(),
            reviewedByUserId: reviewerUserId,
          },
          select: {
            id: true,
            followUpId: true,
            submittedByUserId: true,
            photoUrl: true,
            storagePath: true,
            mimeType: true,
            fileSize: true,
            message: true,
            submittedAt: true,
            status: true,
            reviewedAt: true,
            reviewedByUserId: true,
            reviewNote: true,
          },
        })

        await tx.adoptionFollowUp.update({
          where: { id: submission.followUpId },
          data: { status: 'APPROVED' },
        })

        await tx.auditLog.create({
          data: {
            actorUserId: reviewerUserId,
            action: 'APPROVE',
            entityType: 'FOLLOW_UP_SUBMISSION',
            entityId: submissionId,
            metadata: {},
          },
        })

        return submission
      })
    },

    async rejectSubmission(submissionId, reviewerUserId, reviewNote) {
      return prisma.$transaction(async (tx) => {
        const submission = await tx.adoptionFollowUpSubmission.update({
          where: { id: submissionId },
          data: {
            status: 'REJECTED',
            reviewedAt: new Date(),
            reviewedByUserId: reviewerUserId,
            reviewNote,
          },
          select: {
            id: true,
            followUpId: true,
            submittedByUserId: true,
            photoUrl: true,
            storagePath: true,
            mimeType: true,
            fileSize: true,
            message: true,
            submittedAt: true,
            status: true,
            reviewedAt: true,
            reviewedByUserId: true,
            reviewNote: true,
          },
        })

        await tx.adoptionFollowUp.update({
          where: { id: submission.followUpId },
          data: { status: 'PENDING' },
        })

        await tx.auditLog.create({
          data: {
            actorUserId: reviewerUserId,
            action: 'REJECT',
            entityType: 'FOLLOW_UP_SUBMISSION',
            entityId: submissionId,
            metadata: { reviewNote },
          },
        })

        return submission
      })
    },

    async listSubmissionsAdmin(input) {
      const page = Math.max(1, input.page ?? 1)
      const perPage = Math.min(50, Math.max(1, input.perPage ?? 20))

      const where: Record<string, unknown> = {}
      if (input.status) {
        where.status = input.status as 'SUBMITTED' | 'APPROVED' | 'REJECTED'
      }
      if (input.workspaceId) {
        where.followUp = { adoption: { workspaceId: input.workspaceId } }
      }

      const [rows, total] = await Promise.all([
        prisma.adoptionFollowUpSubmission.findMany({
          where,
          select: {
            id: true,
            status: true,
            submittedAt: true,
            photoUrl: true,
            message: true,
            followUp: {
              select: {
                id: true,
                type: true,
                scheduledAt: true,
                adoption: {
                  select: {
                    id: true,
                    workspaceId: true,
                    pet: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        prisma.adoptionFollowUpSubmission.count({ where }),
      ])

      return {
        items: rows.map((r) => ({
          id: r.id,
          status: r.status,
          submittedAt: r.submittedAt,
          photoUrl: r.photoUrl,
          message: r.message,
          followUp: {
            id: r.followUp.id,
            type: r.followUp.type,
            scheduledAt: r.followUp.scheduledAt,
            adoption: {
              id: r.followUp.adoption.id,
              workspaceId: r.followUp.adoption.workspaceId,
              pet: r.followUp.adoption.pet,
            },
          },
        })),
        total,
        page,
        perPage,
      }
    },

    async findAdoptionsByGuardian(guardianUserId, input) {
      const page = Math.max(1, input.page ?? 1)
      const perPage = Math.min(20, Math.max(1, input.perPage ?? 10))

      const where = { guardianUserId }

      const [rows, total] = await Promise.all([
        prisma.adoption.findMany({
          where,
          select: {
            id: true,
            adoptedAt: true,
            status: true,
            notes: true,
            pet: {
              select: {
                id: true,
                name: true,
                species: true,
                images: {
                  where: { isCover: true },
                  take: 1,
                  select: { url: true },
                },
              },
            },
            followUps: {
              select: {
                id: true,
                type: true,
                scheduledAt: true,
                status: true,
                currentSubmission: {
                  select: { status: true },
                },
              },
              orderBy: { scheduledAt: 'asc' },
            },
          },
          orderBy: { adoptedAt: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        prisma.adoption.count({ where }),
      ])

      return {
        items: rows.map((r) => ({
          id: r.id,
          adoptedAt: r.adoptedAt,
          status: r.status,
          notes: r.notes,
          pet: {
            id: r.pet.id,
            name: r.pet.name,
            species: r.pet.species,
            coverImage: r.pet.images[0] ? { url: r.pet.images[0].url } : null,
          },
          followUps: r.followUps.map((f) => ({
            id: f.id,
            type: f.type,
            scheduledAt: f.scheduledAt,
            status: f.status,
            currentSubmission: f.currentSubmission
              ? { status: f.currentSubmission.status }
              : null,
          })),
        })),
        total,
        page,
        perPage,
      }
    },
  }
}
