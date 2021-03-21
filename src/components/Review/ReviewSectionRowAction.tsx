import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Grid, Icon, Message } from 'semantic-ui-react'
import { useRouter } from '../../utils/hooks/useRouter'
import { ReviewAction, ReviewProgress, ReviewSectionComponentProps } from '../../utils/types'
import strings from '../../utils/constants'
import { useUserState } from '../../contexts/UserState'
import useCreateReview from '../../utils/hooks/useCreateReview'
import useRestartReview from '../../utils/hooks/useRestartReview'
import { ReviewStatus } from '../../utils/generated/graphql'
import useAssignSectionToUser from '../../utils/hooks/useAssignSectionToUser'

const ReviewSectionRowAction: React.FC<ReviewSectionComponentProps> = (props) => {
  const {
    location: { pathname },
    push,
  } = useRouter()

  const {
    action,
    section: { details, reviewProgress },
    isAssignedToCurrentUser,
    isCurrentUserReview,
    thisReview,
  } = props

  const reviewPath = `${pathname}/${thisReview?.id}`
  const reviewSectionLink = `${reviewPath}?activeSections=${details.code}`

  const getContent = () => {
    console.log(action)
    switch (action) {
      case ReviewAction.canContinue: {
        if (isAssignedToCurrentUser) {
          if (reReviewableCount(reviewProgress)) return <ReReviewButton {...props} />

          return (
            <Link
              style={{
                color: '#003BFE',
                fontWeight: 800,
                letterSpacing: 1,
                background: 'none',
                border: 'none',
                fontSize: 16,
              }}
              to={reviewSectionLink}
            >
              {strings.ACTION_CONTINUE}
            </Link>
          )
        } else
          return (
            <div style={{ color: 'rgb(130, 130, 130)', fontStyle: 'italic', marginRight: 20 }}>
              In progress
            </div>
          )
      }
      case ReviewAction.canView: {
        if (isAssignedToCurrentUser)
          return (
            <Link
              style={{
                color: '#003BFE',
                fontWeight: 800,
                letterSpacing: 1,
                background: 'none',
                border: 'none',
                fontSize: 16,
              }}
              to={`${reviewSectionLink}`}
            >
              {strings.ACTION_VIEW}
            </Link>
          )
        else
          return (
            <Icon
              style={{ color: 'rgb(130, 130, 130)' }}
              onClick={() => push(reviewSectionLink)}
              name="angle right"
            />
          )
      }

      case ReviewAction.canStartReview: {
        if (isCurrentUserReview) return <StartReviewButton {...props} />

        return (
          <div style={{ color: 'rgb(130, 130, 130)', fontStyle: 'italic', marginRight: 20 }}>
            Not started yet
          </div>
        )
      }

      case ReviewAction.canReReview: {
        if (isAssignedToCurrentUser) return <ReReviewButton {...props} />

        return null
      }
      case ReviewAction.canSelfAssign: {
        if (isCurrentUserReview) return <SelfAssign {...props} />
        return null
      }
      default:
        return null
    }
  }

  return (
    <Grid.Column textAlign="right" style={{}}>
      {getContent()}
    </Grid.Column>
  )
}

const reReviewableCount = (reviewProgress?: ReviewProgress) =>
  (reviewProgress?.totalNewReviewable || 0) - (reviewProgress?.doneNewReviewable || 0)

// RE-REVIEW button
const ReReviewButton: React.FC<ReviewSectionComponentProps> = ({
  fullStructure,
  section: { details, reviewProgress },
}) => {
  const {
    location: { pathname },
    push,
  } = useRouter()

  const [restartReviewError, setRestartReviewError] = useState(false)
  const reviewId = fullStructure.thisReview?.id

  const restartReview = useRestartReview(reviewId || 0)

  const restart = async () => {
    {
      try {
        const result = await restartReview(fullStructure)
        const responseCheck = result.data?.updateReview?.review?.id
        if (!responseCheck) throw new Error('Review ID is missing from response')
        push(`${pathname}/${reviewId}?activeSections=${details.code}`)
      } catch (e) {
        console.error(e)
        return setRestartReviewError(true)
      }
    }
  }

  if (restartReviewError) return <Message error title={strings.ERROR_GENERIC} />

  // Either need to run a mutation to re-review or just navigate to section
  const buttonAction =
    fullStructure.thisReview?.status == ReviewStatus.Draft
      ? () => push(`${pathname}/${reviewId}?activeSections=${details.code}`)
      : restart

  return (
    <Button
      style={{
        color: '#003BFE',
        fontWeight: 400,
        letterSpacing: 1,
        background: 'none',
        border: 'none',
        fontSize: 16,
      }}
      onClick={buttonAction}
    >{`${strings.BUTTON_REVIEW_RE_REVIEW} (${reReviewableCount(reviewProgress)})`}</Button>
  )
}

// START REVIEW button
const SelfAssign: React.FC<ReviewSectionComponentProps> = ({ assignment, fullStructure }) => {
  const [startReviewError, setStartReviewError] = useState(false)

  const assign = useAssignSectionToUser({ structure: fullStructure })

  const startReview = async () => {
    {
      try {
        const result = await assign(assignment, true)
        const reviewAssignmentId = result.data?.updateReviewAssignment?.reviewAssignment?.id
        if (!reviewAssignmentId) throw new Error('Review Assignment ID is missing from response')
      } catch (e) {
        console.error(e)
        return setStartReviewError(true)
      }
    }
  }

  if (startReviewError) return <Message error title={strings.ERROR_GENERIC} />

  return (
    <Button
      as="a"
      onClick={startReview}
      style={{
        color: '#003BFE',
        fontWeight: 400,
        letterSpacing: 1,
        background: 'none',
        border: 'none',
        fontSize: 16,
      }}
    >
      Self Assign
    </Button>
  )
}

// START REVIEW button
const StartReviewButton: React.FC<ReviewSectionComponentProps> = ({
  assignment,
  fullStructure,
  section: { details },
}) => {
  const {
    userState: { currentUser },
  } = useUserState()
  const {
    location: { pathname },
    push,
  } = useRouter()

  const [startReviewError, setStartReviewError] = useState(false)

  const { createReviewFromStructure } = useCreateReview({
    reviewAssigmentId: assignment.id,
    reviewerId: currentUser?.userId as number,
    serialNumber: fullStructure.info.serial,
    // TODO: Remove this
    onCompleted: () => {},
  })

  const startReview = async () => {
    {
      try {
        const result = await createReviewFromStructure(fullStructure)
        const newReviewId = result.data?.createReview?.review?.id
        if (!newReviewId) throw new Error('Review ID is missing from response')
        push(`${pathname}/${newReviewId}?activeSections=${details.code}`)
      } catch (e) {
        console.error(e)
        return setStartReviewError(true)
      }
    }
  }

  if (startReviewError) return <Message error title={strings.ERROR_GENERIC} />

  return (
    <Button
      as="a"
      onClick={startReview}
      style={{
        color: '#003BFE',
        fontWeight: 400,
        letterSpacing: 1,
        background: 'none',
        border: 'none',
        fontSize: 16,
      }}
    >
      {strings.ACTION_START}
    </Button>
  )
}

export default ReviewSectionRowAction
