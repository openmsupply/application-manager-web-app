import React from 'react'
import { Grid } from 'semantic-ui-react'
import { ReviewAction, ReviewSectionComponentProps } from '../../utils/types'
import { SectionProgressBar } from './SectionProgress'
import strings from '../../utils/constants'

const ReviewSectionRowProgress: React.FC<ReviewSectionComponentProps> = ({
  action,
  section,
  isAssignedToCurrentUser,
}) => {
  // Set default for SectionProgressBar
  const reviewProgress = section.reviewProgress || {
    totalReviewable: 0,
    doneConform: 0,
    doneNonConform: 0,
  }

  const getContent = () => {
    switch (action) {
      case ReviewAction.canStartReview: {
        if (isAssignedToCurrentUser) return null
        return strings.STATUS_NOT_STARTED
      }
      case ReviewAction.canView: {
        return <SectionProgressBar reviewProgress={reviewProgress} />
      }
      case ReviewAction.canContinue: {
        if (isAssignedToCurrentUser) return <SectionProgressBar reviewProgress={reviewProgress} />
        return strings.STATUS_IN_PROGRESS
      }
      case 'canReReview': {
        if (isAssignedToCurrentUser) return <SectionProgressBar reviewProgress={reviewProgress} />
        return strings.IN_PROGRESS
      }
      default:
        return null
    }
  }

  return <Grid.Column>{getContent()}</Grid.Column>
}

export default ReviewSectionRowProgress
