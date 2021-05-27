import React from 'react'
import { Grid } from 'semantic-ui-react'
import { ReviewAction, ReviewSectionComponentProps } from '../../utils/types'
import { ConsolidationSectionProgressBar, ReviewSectionProgressBar } from '../'

const ReviewSectionRowProgress: React.FC<ReviewSectionComponentProps> = ({
  action,
  section: { reviewProgress, consolidationProgress },
  isAssignedToCurrentUser,
  isConsolidation,
}) => {
  const getContent = () => {
    switch (action) {
      case ReviewAction.canStartReview: {
        return null
      }
      case ReviewAction.canView:
      case ReviewAction.canReReview:
        if (isConsolidation)
          return <ConsolidationSectionProgressBar consolidationProgress={consolidationProgress} />
        return <ReviewSectionProgressBar reviewProgress={reviewProgress} />
      case ReviewAction.canContinue:
        if (!isAssignedToCurrentUser) return null
        if (isConsolidation)
          return <ConsolidationSectionProgressBar consolidationProgress={consolidationProgress} />
        return <ReviewSectionProgressBar reviewProgress={reviewProgress} />
      default:
        return null
    }
  }

  return <Grid.Column>{getContent()}</Grid.Column>
}

export default ReviewSectionRowProgress
