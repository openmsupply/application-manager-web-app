import React from 'react'
import { Icon, Grid } from 'semantic-ui-react'
import { ReviewResponse } from '../../../utils/generated/graphql'
import { ElementDecisionLabel } from '../../Review'

interface ReviewResponseElementProps {
  isCurrentReview: boolean
  isConsolidation: boolean
  shouldDim?: boolean
  shouldHideDecision?: boolean
  reviewResponse: ReviewResponse
}

const ReviewResponseElement: React.FC<ReviewResponseElementProps> = ({
  isCurrentReview,
  isConsolidation,
  reviewResponse,
  shouldDim = false,
  children,
  shouldHideDecision = false,
}) => {
  const backgroundClass = isCurrentReview ? 'changeable-background' : ''
  const dimClass = shouldDim ? 'dim' : ''

  return (
    <div className={`response-container ${backgroundClass} ${dimClass}`}>
      <div className="review-response-content ">
        {!shouldHideDecision && (
          <ElementDecisionLabel isConsolidation={isConsolidation} reviewResponse={reviewResponse} />
        )}
        {!reviewResponse.comment ? null : (
          <div className="comment-container">
            <Icon name="comment alternate outline" color="grey" />
            <p className="secondary">{reviewResponse.comment}</p>
          </div>
        )}
      </div>

      <div className="action-container">{children}</div>
    </div>
  )
}

export default ReviewResponseElement
