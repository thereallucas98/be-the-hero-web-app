import { builder } from '../builder'
import { PetDetailType, PetType } from './pet.type'

const FollowUpSubmissionType = builder.simpleObject('FollowUpSubmission', {
  fields: (t) => ({
    id: t.id(),
    status: t.string(),
    submittedAt: t.field({ type: 'DateTime' }),
  }),
})

const FollowUpType = builder.simpleObject('FollowUp', {
  fields: (t) => ({
    id: t.id(),
    type: t.string(),
    status: t.string(),
    scheduledAt: t.field({ type: 'DateTime' }),
    currentSubmission: t.field({
      type: FollowUpSubmissionType,
      nullable: true,
    }),
  }),
})

const GuardianInfoType = builder.simpleObject('GuardianInfo', {
  fields: (t) => ({
    id: t.id(),
    fullName: t.string(),
    email: t.string(),
  }),
})

const WorkspaceInfoType = builder.simpleObject('WorkspaceInfo', {
  fields: (t) => ({
    id: t.id(),
    name: t.string(),
  }),
})

export const GuardianAdoptionType = builder.simpleObject('GuardianAdoption', {
  fields: (t) => ({
    id: t.id(),
    adoptedAt: t.field({ type: 'DateTime' }),
    status: t.string(),
    notes: t.string({ nullable: true }),
    pet: t.field({ type: PetType }),
    followUps: t.field({ type: [FollowUpType] }),
  }),
})

export const GuardianAdoptionPageType = builder.simpleObject(
  'GuardianAdoptionPage',
  {
    fields: (t) => ({
      items: t.field({ type: [GuardianAdoptionType] }),
      total: t.int(),
      page: t.int(),
      perPage: t.int(),
    }),
  },
)

export const AdoptionDetailType = builder.simpleObject('AdoptionDetail', {
  fields: (t) => ({
    id: t.id(),
    petId: t.id(),
    workspaceId: t.id(),
    guardianUserId: t.id(),
    adoptedAt: t.field({ type: 'DateTime' }),
    notes: t.string({ nullable: true }),
    status: t.string(),
    createdAt: t.field({ type: 'DateTime' }),
    pet: t.field({ type: PetDetailType }),
    guardian: t.field({ type: GuardianInfoType }),
    workspace: t.field({ type: WorkspaceInfoType }),
    followUps: t.field({ type: [FollowUpType] }),
  }),
})
