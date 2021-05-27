import React from 'react'
import { Icon, Label } from 'semantic-ui-react'
import { ReviewResponse, ReviewResponseDecision } from '../../utils/generated/graphql'
import strings from '../../utils/constants'
import getSimplifiedTimeDifference from '../../utils/dateAndTime/getSimplifiedTimeDifference'

interface DecisionLabelProps {
  isCurrentReview: boolean
  isConsolidation: boolean
  reviewResponse: ReviewResponse
  originalReviewResponse?: ReviewResponse
}

const DecisionLabel: React.FC<DecisionLabelProps> = ({
  isCurrentReview,
  isConsolidation,
  reviewResponse,
  originalReviewResponse,
}) => {
  const isPositiveDecision = () =>
    reviewResponse.decision ===
    (isConsolidation ? ReviewResponseDecision.Agree : ReviewResponseDecision.Approve)

  const getLabel = () => (
    <Label className="simple-label">
      <strong>
        {isConsolidation
          ? getConsolidationDecisionLabel(reviewResponse, originalReviewResponse)
          : getReviewDecisionLabel(reviewResponse)}
      </strong>
    </Label>
  )

  return (
    <div>
      {isCurrentReview && (
        <Icon name="circle" size="tiny" color={isPositiveDecision() ? 'green' : 'pink'} />
      )}
      {getLabel()}
      <Label size="mini" className="simple-label shift-up-1">
        <strong>{getSimplifiedTimeDifference(reviewResponse.timeUpdated)}</strong>
      </Label>
    </div>
  )
}

const getConsolidationDecisionLabel = (
  reviewResponse: ReviewResponse,
  originalReviewResponse?: ReviewResponse
) => {
  // TODO: Improve this error
  if (!originalReviewResponse) return 'Consolidation invalid'

  const { decision } = reviewResponse
  const { decision: originalDecision } = originalReviewResponse
  switch (decision) {
    case ReviewResponseDecision.Agree:
      return originalDecision === ReviewResponseDecision.Approve
        ? strings.LABEL_CONSOLIDATION_AGREED_CONFORM
        : strings.LABEL_CONSOLIDATION_AGREED_NON_CONFORM
    case ReviewResponseDecision.Disagree:
      return originalDecision === ReviewResponseDecision.Approve
        ? strings.LABEL_CONSOLIDATION_DISAGREED_CONFORM
        : strings.LABEL_CONSOLIDATION_DISAGREED_NON_CONFORM
    default:
      return null
  }
}

const getReviewDecisionLabel = (reviewResponse: ReviewResponse) =>
  reviewResponse?.decision === ReviewResponseDecision.Approve
    ? strings.LABEL_REVIEW_DECICION_CONFORM
    : strings.LABEL_REVIEW_DECISION_NON_CONFORM

export default DecisionLabel
