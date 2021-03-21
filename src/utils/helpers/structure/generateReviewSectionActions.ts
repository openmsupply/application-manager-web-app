import { ReviewStatus, ReviewAssignmentStatus } from '../../generated/graphql'
import { SectionStateNEW, AssignmentDetailsNEW, ReviewDetails, ReviewAction } from '../../types'

type GenerateSectionActions = (props: {
  sections: SectionStateNEW[]
  reviewAssignment: AssignmentDetailsNEW
  thisReview?: ReviewDetails | null
  currentUserId: number
}) => void

const levelOneActions: { [key in ReviewStatus | 'unknown']: ReviewAction } = {
  [ReviewStatus.Draft]: ReviewAction.canContinue,
  [ReviewStatus.Submitted]: ReviewAction.canView,
  [ReviewStatus.Pending]: ReviewAction.canReReview,
  [ReviewStatus.Locked]: ReviewAction.canContinueLocked,
  [ReviewStatus.ChangesRequested]: ReviewAction.canUpdate,
  unknown: ReviewAction.unknown,
}

const generateReviewSectionActions: GenerateSectionActions = ({
  sections,
  reviewAssignment,
  thisReview,
  currentUserId,
}) => {
  let baseAction: ReviewAction | undefined
  if (reviewAssignment?.status === ReviewAssignmentStatus.AvailableForSelfAssignment)
    baseAction = ReviewAction.canSelfAssign
  if (reviewAssignment?.status === ReviewAssignmentStatus.Assigned && !thisReview)
    baseAction = ReviewAction.canStartReview
  const isCurrentUserReview = reviewAssignment.reviewer.id === currentUserId
  sections.forEach((section) => {
    // would need to juggled this around a little bit for level > 1 (i.e. only show canStartReview where sections submitted lvl < 1 review with no linked thisReviewResponse)
    const isReviewable = (section.reviewProgress?.totalReviewable || 0) > 0
    const isAssignedToCurrentUser = isCurrentUserReview && isReviewable

    section.reviewAction = {
      isAssignedToCurrentUser,
      isCurrentUserReview,
      isReviewable,
      action: baseAction || levelOneActions[thisReview?.status || 'unknown'],
    }
  })
}

export default generateReviewSectionActions
