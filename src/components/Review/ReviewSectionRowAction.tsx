import React, { useState } from 'react'
import { Grid, Icon, Label, Message } from 'semantic-ui-react'
import { useRouter } from '../../utils/hooks/useRouter'
import { ReviewAction, ReviewProgress, ReviewSectionComponentProps } from '../../utils/types'
import strings from '../../utils/constants'
import useCreateReview from '../../utils/hooks/useCreateReview'
import useRestartReview from '../../utils/hooks/useRestartReview'
import { ReviewStatus } from '../../utils/generated/graphql'
import useUpdateReviewAssignment from '../../utils/hooks/useUpdateReviewAssignment'

const ReviewSectionRowAction: React.FC<ReviewSectionComponentProps> = (props) => {
  const {
    action,
    isAssignedToCurrentUser,
    assignment: { isCurrentUserReviewer },
  } = props

  const getContent = () => {
    switch (action) {
      case ReviewAction.canContinue: {
        if (isAssignedToCurrentUser) {
          return <StartContinueOrRestartButton {...props} />
        }
        return (
          <Label className="simple-label">
            <em>{strings.STATUS_IN_PROGRESS}</em>
          </Label>
        )
      }

      case ReviewAction.canView: {
        if (isAssignedToCurrentUser) {
          return <ViewSubmittedReviewButton {...props} />
        }
        return <ViewReviewIcon {...props} />
      }

      case ReviewAction.canUpdate:
      case ReviewAction.canStartReview: {
        if (isAssignedToCurrentUser) {
          return <StartContinueOrRestartButton {...props} />
        }
        return <NotStartedLabel />
      }

      case ReviewAction.canReReview: {
        if (isAssignedToCurrentUser) return <StartContinueOrRestartButton {...props} />

        return null
      }

      case ReviewAction.canSelfAssign: {
        if (isCurrentUserReviewer) return <SelfAssignButton {...props} />
        return null
      }

      default:
        return null
    }
  }

  return <Grid.Column textAlign="right">{getContent()}</Grid.Column>
}

const reReviewableCount = (reviewProgress?: ReviewProgress) =>
  (reviewProgress?.totalNewReviewable || 0) - (reviewProgress?.doneNewReviewable || 0)

// START REVIEW, CONTINUE REVIEW, UPDATE REVIEW OR RE-REVIEW BUTTON
const StartContinueOrRestartButton: React.FC<ReviewSectionComponentProps> = ({
  fullStructure,
  section: { details, reviewProgress },
  assignment,
  thisReview,
  action,
}) => {
  const {
    location: { pathname },
    push,
  } = useRouter()

  const [error, setError] = useState(false)

  const restartReview = useRestartReview({
    reviewId: thisReview?.id || 0,
    structure: fullStructure,
    assignment,
  })

  const createReview = useCreateReview({
    structure: fullStructure,
    assignment,
  })

  const getButtonName = () => {
    const reReviewCount = reReviewableCount(reviewProgress)
    if (reReviewCount > 0) return `${strings.BUTTON_REVIEW_RE_REVIEW} (${reReviewCount})`
    switch (action) {
      case ReviewAction.canUpdate:
        return strings.ACTION_UPDATE
      case ReviewAction.canContinue:
        return strings.ACTION_CONTINUE
      default:
        return strings.ACTION_START
    }
  }

  const doAction = async () => {
    let reviewId = thisReview?.id as number
    if (thisReview?.status == ReviewStatus.Draft)
      return push(`${pathname}/${reviewId}?activeSections=${details.code}`)

    try {
      if (thisReview) await restartReview()
      else reviewId = (await createReview()).data?.createReview?.review?.id as number
      push(`${pathname}/${reviewId}?activeSections=${details.code}`)
    } catch (e) {
      console.log(e)
      return setError(true)
    }
  }

  if (error) return <Message error title={strings.ERROR_GENERIC} />

  return (
    <a className="user-action clickable" onClick={doAction}>
      {getButtonName()}
    </a>
  )
}

// SELF ASSIGN REVIEW button
const SelfAssignButton: React.FC<ReviewSectionComponentProps> = ({
  assignment,
  fullStructure: structure,
}) => {
  const [assignmentError, setAssignmentError] = useState(false)
  const { assignSectionToUser } = useUpdateReviewAssignment(structure)

  const selfAssignReview = async () => {
    {
      try {
        await assignSectionToUser({ assignment, isSelfAssignment: true })
      } catch (e) {
        console.log(e)
        setAssignmentError(true)
      }
    }
  }

  if (assignmentError) return <Message error title={strings.ERROR_GENERIC} />

  return (
    <a className="user-action clickable" onClick={selfAssignReview}>
      {strings.BUTTON_SELF_ASSIGN}
    </a>
  )
}

const ViewSubmittedReviewButton: React.FC<ReviewSectionComponentProps> = ({
  fullStructure,
  section: { details },
}) => {
  const { pathname, push } = useRouter()
  const reviewId = fullStructure.thisReview?.id
  return (
    <a
      className="user-action clickable"
      onClick={() => push(`${pathname}/${reviewId}?activeSections=${details.code}`)}
    >
      {strings.ACTION_VIEW}
    </a>
  )
}

// VIEW REVIEW Icon
const ViewReviewIcon: React.FC<ReviewSectionComponentProps> = ({
  fullStructure,
  section: { details },
}) => {
  const { pathname, push } = useRouter()

  const reviewId = fullStructure.thisReview?.id
  return (
    <Icon
      name="chevron right"
      className="dark-grey"
      onClick={() => push(`${pathname}/${reviewId}?activeSections=${details.code}`)}
    />
  )
}

// NOT_STARTED LABEL
const NotStartedLabel: React.FC = () => (
  <Label className="simple-label" content={strings.STATUS_NOT_STARTED} />
)

export default ReviewSectionRowAction
