import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Grid, Message } from 'semantic-ui-react'
import { useRouter } from '../../utils/hooks/useRouter'
import { ReviewAction, ReviewSectionComponentProps } from '../../utils/types'
import strings from '../../utils/constants'
import { useUserState } from '../../contexts/UserState'
import useCreateReview from '../../utils/hooks/useCreateReview'

const ReviewSectionRowAction: React.FC<ReviewSectionComponentProps> = (props) => {
  const {
    location: { pathname },
  } = useRouter()

  const {
    action,
    section: { details },
    isAssignedToCurrentUser,

    thisReview,
  } = props

  const reviewPath = `${pathname}/${thisReview?.id}`
  const reviewSectionLink = `${reviewPath}?activeSections=${details.code}`

  const getContent = () => {
    switch (action) {
      case ReviewAction.canContinue: {
        if (isAssignedToCurrentUser)
          return <Link to={reviewSectionLink}>{strings.ACTION_CONTINUE}</Link>

        return <p>In Review</p>
      }
      case ReviewAction.canView: {
        if (isAssignedToCurrentUser)
          return <Link to={`${reviewSectionLink}`}>{strings.ACTION_VIEW}</Link>
        else return <Link to={`${reviewSectionLink}`}>{strings.ACTION_VIEW}</Link>
      }

      case ReviewAction.canStartReview: {
        if (isAssignedToCurrentUser) return <StartReviewButton {...props} />

        return null
      }
      default:
        return null
    }
  }

  return <Grid.Column textAlign="right">{getContent()}</Grid.Column>
}

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

  return <Button onClick={startReview}>{strings.ACTION_START}</Button>
}

export default ReviewSectionRowAction
