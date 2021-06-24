import { ReviewStatus, ReviewAssignmentStatus } from '../../generated/graphql'
import {
  SectionState,
  AssignmentDetails,
  ReviewDetails,
  ReviewAction,
  ConsolidationProgress,
  ReviewProgress,
} from '../../types'

type GenerateSectionActions = (props: {
  sections: SectionState[]
  reviewAssignment: AssignmentDetails
  thisReview?: ReviewDetails | null
  currentUserId: number
}) => void

type ActionDefinition = {
  action: ReviewAction
  checkMethod: (props: {
    reviewLevel: number
    isReviewable: boolean
    isAssignedToCurrentUser: boolean
    reviewAssignmentStatus: ReviewAssignmentStatus | null
    isPendingReview: boolean
    isReviewExisting: boolean
    reviewStatus: ReviewStatus | undefined
    isCurrentUserReview: boolean
    isReviewActive: boolean
  }) => boolean
}

const actionDefinitions: ActionDefinition[] = [
  {
    action: ReviewAction.canStartReview,
    checkMethod: ({ reviewAssignmentStatus, isPendingReview, isReviewExisting }) => {
      return (
        reviewAssignmentStatus === ReviewAssignmentStatus.Assigned &&
        !isReviewExisting &&
        isPendingReview
      )
    },
  },
  {
    action: ReviewAction.canReReview,
    checkMethod: ({ reviewStatus, reviewLevel }) =>
      reviewStatus === ReviewStatus.Pending && reviewLevel === 1,
  },
  {
    action: ReviewAction.canReStartReview,
    checkMethod: ({ reviewStatus, reviewLevel, isReviewActive }) =>
      reviewStatus === ReviewStatus.Pending && reviewLevel > 1 && !isReviewActive,
  },
  {
    action: ReviewAction.canContinue,
    checkMethod: ({ reviewStatus, reviewLevel, isReviewActive }) =>
      reviewStatus === ReviewStatus.Pending && reviewLevel > 1 && isReviewActive,
  },
  {
    action: ReviewAction.canContinueLocked,
    checkMethod: ({ reviewStatus }) => reviewStatus === ReviewStatus.Locked,
  },
  {
    action: ReviewAction.canSelfAssign,
    checkMethod: ({ reviewAssignmentStatus }) =>
      reviewAssignmentStatus === ReviewAssignmentStatus.AvailableForSelfAssignment,
  },
  {
    action: ReviewAction.canSelfAssignLocked,
    checkMethod: ({ reviewAssignmentStatus }) =>
      reviewAssignmentStatus === ReviewAssignmentStatus.SelfAssignedByAnother,
  },
  {
    action: ReviewAction.canContinue,
    checkMethod: ({ reviewStatus, isReviewActive }) =>
      reviewStatus === ReviewStatus.Draft && isReviewActive,
  },
  {
    action: ReviewAction.canView,
    checkMethod: ({ reviewStatus, isReviewActive }) =>
      reviewStatus === ReviewStatus.Draft && !isReviewActive,
  },
  {
    action: ReviewAction.canView,
    checkMethod: ({ reviewStatus }) => reviewStatus === ReviewStatus.Submitted,
  },
  {
    action: ReviewAction.canUpdate,
    checkMethod: ({ reviewStatus }) => reviewStatus === ReviewStatus.ChangesRequested,
  },
]

const generateReviewSectionActions: GenerateSectionActions = ({
  sections,
  reviewAssignment,
  thisReview,
  currentUserId,
}) => {
  const isCurrentUserReview = reviewAssignment.reviewer.id === currentUserId
  const isConsolidation = reviewAssignment.level > 1

  sections.forEach((section) => {
    const { totalReviewable, totalPendingReview, totalActive } = isConsolidation
      ? (section.consolidationProgress as ConsolidationProgress)
      : (section.reviewProgress as ReviewProgress)

    const isReviewable = (totalReviewable || 0) > 0
    const isAssignedToCurrentUser = isCurrentUserReview && isReviewable

    const checkMethodProps = {
      isReviewable,
      isAssignedToCurrentUser,
      isCurrentUserReview,
      reviewLevel: reviewAssignment.level,
      reviewAssignmentStatus: reviewAssignment.status,
      isReviewExisting: !!thisReview,
      reviewStatus: thisReview?.status,
      isPendingReview: (totalPendingReview || 0) > 0,
      isReviewActive: (totalActive || 0) > 0,
    }

    const foundAction = actionDefinitions.find(({ checkMethod }) => checkMethod(checkMethodProps))

    section.assignment = {
      isAssignedToCurrentUser,
      isReviewable,
      isConsolidation,
      action: foundAction ? foundAction.action : ReviewAction.unknown,
    }
  })
}

export default generateReviewSectionActions
