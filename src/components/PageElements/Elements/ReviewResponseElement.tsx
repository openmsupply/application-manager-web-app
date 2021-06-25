import React from 'react'
import { ReviewResponse } from '../../../utils/generated/graphql'
import { ElementDecisionLabel } from '../../Review'

interface ReviewResponseElementProps {
  isCurrentReview: boolean
  isConsolidation: boolean
  isDecisionVisible?: boolean
  shouldDim?: boolean
  reviewResponse?: ReviewResponse
  originalReviewResponse?: ReviewResponse
  isActiveEdit?: boolean
  setIsActiveEdit?: Function
}

const ReviewResponseElement: React.FC<ReviewResponseElementProps> = ({
  isCurrentReview,
  isConsolidation,
  isDecisionVisible = true,
  shouldDim = false,
  reviewResponse,
  children,
}) => {
  const backgroundClass = isCurrentReview ? 'changeable-background' : ''
  const dimClass = shouldDim ? 'dim' : ''

  if (!reviewResponse) return null

  return (
    <div className={`response-container ${backgroundClass} ${dimClass}`}>
      <ElementDecisionLabel
        isConsolidation={isConsolidation}
        reviewResponse={reviewResponse}
        isDecisionVisible={isDecisionVisible}
      />
      <div className="action-container">{children}</div>
    </div>
  )
}

export default ReviewResponseElement
