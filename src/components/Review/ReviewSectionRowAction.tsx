import React, { CSSProperties, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Grid, Icon, Message } from 'semantic-ui-react'
import { useRouter } from '../../utils/hooks/useRouter'
import { ReviewAction, ReviewProgress, ReviewSectionComponentProps } from '../../utils/types'
import strings from '../../utils/constants'
import useCreateReview from '../../utils/hooks/useCreateReview'
import useRestartReview from '../../utils/hooks/useRestartReview'
import { ReviewStatus } from '../../utils/generated/graphql'
import useUpdateReviewAssignment from '../../utils/hooks/useUpdateReviewAssignment'

const ReviewSectionRowAction: React.FC<ReviewSectionComponentProps> = (props) => {
  const {
    location: { pathname },
  } = useRouter()

  const {
    action,
    section: { reviewProgress },
    isAssignedToCurrentUser,
    assignment: { isCurrentUserReviewer },
    thisReview,
  } = props

  const reviewPath = `${pathname}/${thisReview?.id}`

  const getContent = () => {
    switch (action) {
      case ReviewAction.canContinue: {
        if (isAssignedToCurrentUser) {
          if (reReviewableCount(reviewProgress)) return <ReReviewButton {...props} />
          else return <ContinueReviewButton {...props} />
        } else return <div style={inProgressStyle}>{strings.STATUS_IN_PROGRESS}</div>
      }
      case ReviewAction.canView: {
        if (isAssignedToCurrentUser) return <ContinueReviewButton {...props} />
        else return <ViewReviewIcon {...props} />
      }

      case ReviewAction.canStartReview: {
        if (isAssignedToCurrentUser) return <StartReviewButton {...props} />
        else return <NotStartedLabel />
      }

      case ReviewAction.canReReview: {
        if (isAssignedToCurrentUser) return <ReReviewButton {...props} />

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

// RE-REVIEW button
const ReReviewButton: React.FC<ReviewSectionComponentProps> = ({
  fullStructure,
  section: { details, reviewProgress },
  assignment,
}) => {
  const {
    location: { pathname },
    push,
  } = useRouter()

  const [restartReviewError, setRestartReviewError] = useState(false)
  const reviewId = fullStructure.thisReview?.id

  const restartReview = useRestartReview({
    reviewId: reviewId || 0,
    structure: fullStructure,
    assignment,
  })

  const restart = async () => {
    {
      try {
        await restartReview()
        push(`${pathname}/${reviewId}?activeSections=${details.code}`)
      } catch (e) {
        console.error(e)
        return setRestartReviewError(true)
      }
    }
  }

  if (restartReviewError) return <Message error title={strings.ERROR_GENERIC} />

  if (reReviewableCount(reviewProgress) === 0) return null

  const reReviewCount = reReviewableCount(reviewProgress)

  if (reReviewCount === 0) return null

  // Either need to run a mutation to re-review or just navigate to section
  const buttonAction =
    fullStructure.thisReview?.status == ReviewStatus.Draft
      ? () => push(`${pathname}/${reviewId}?activeSections=${details.code}`)
      : restart

  return (
    <Button
      style={actionReReviewStyle}
      onClick={buttonAction}
    >{`${strings.BUTTON_REVIEW_RE_REVIEW} (${reReviewCount})`}</Button>
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

  return <Button onClick={selfAssignReview}>{strings.BUTTON_SELF_ASSIGN}</Button>
}

// START REVIEW button
const StartReviewButton: React.FC<ReviewSectionComponentProps> = ({
  assignment,
  fullStructure,
  section: { details },
}) => {
  const {
    location: { pathname },
    push,
  } = useRouter()

  const [startReviewError, setStartReviewError] = useState(false)

  const { createReviewFromStructure } = useCreateReview({
    reviewAssigmentId: assignment.id,
  })

  const startReview = async () => {
    {
      try {
        const result = await createReviewFromStructure(fullStructure)
        const newReviewId = result.data?.createReview?.review?.id
        push(`${pathname}/${newReviewId}?activeSections=${details.code}`)
      } catch (e) {
        console.error(e)
        return setStartReviewError(true)
      }
    }
  }

  if (startReviewError) return <Message error title={strings.ERROR_GENERIC} />

  return (
    <div style={actionStartStyle} onClick={startReview}>
      {strings.ACTION_START}
    </div>
  )
}

// CONTINUE REVIEW Button
const ContinueReviewButton: React.FC<ReviewSectionComponentProps> = ({
  fullStructure,
  section: { details },
}) => {
  const {
    location: { pathname },
  } = useRouter()

  const reviewId = fullStructure.thisReview?.id

  return (
    <Link style={actionContinueStyle} to={`${pathname}/${reviewId}?activeSections=${details.code}`}>
      {strings.ACTION_VIEW}
    </Link>
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
      style={viewIconStyle}
      onClick={() => push(`${pathname}/${reviewId}?activeSections=${details.code}`)}
      name="angle right"
    />
  )
}

// NOT_STARTED LABEL
const NotStartedLabel: React.FC = () => (
  <div style={notStartedLabelStyle}>{strings.STATUS_NOT_STARTED}</div>
)

// Styles - TODO: Move to LESS || Global class style (semantic)
const actionContinueStyle = {
  color: '#003BFE',
  fontWeight: 800,
  letterSpacing: 1,
  background: 'none',
  border: 'none',
  fontSize: 16,
} as CSSProperties

const actionStartStyle = {
  color: '#003BFE',
  fontWeight: 400,
  letterSpacing: 1,
  background: 'none',
  border: 'none',
  fontSize: 16,
} as CSSProperties

const actionReReviewStyle = {
  color: '#003BFE',
  fontWeight: 400,
  letterSpacing: 1,
  background: 'none',
  border: 'none',
  fontSize: 16,
} as CSSProperties

const inProgressStyle = {
  color: 'rgb(130, 130, 130)',
  fontStyle: 'italic',
  marginRight: 20,
} as CSSProperties

const viewIconStyle = { color: 'rgb(130, 130, 130)' }

const notStartedLabelStyle = {
  color: 'rgb(130, 130, 130)',
  fontStyle: 'italic',
  marginRight: 20,
} as CSSProperties

export default ReviewSectionRowAction
