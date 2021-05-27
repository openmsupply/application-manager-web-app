import React from 'react'
import { ReviewResponse, ReviewResponseDecision } from '../../utils/generated/graphql'
import strings from '../../utils/constants'
import getSimplifiedTimeDifference from '../../utils/dateAndTime/getSimplifiedTimeDifference'

interface DecisionLabelProps {
  isConsolidation: boolean
  reviewResponse: ReviewResponse
}

const getDecisionString = (isPositiveDecision: boolean, isConsolidation: boolean) => {
  if (isConsolidation) {
    return isPositiveDecision
      ? strings.LABEL_CONSOLIDATION_AGREE
      : strings.LABEL_CONSOLIDATION_DISAGREE
  }

  return isPositiveDecision
    ? strings.LABEL_REVIEW_DECICION_CONFORM
    : strings.LABEL_REVIEW_DECISION_NON_CONFORM
}

const DecisionLabel: React.FC<DecisionLabelProps> = ({ isConsolidation, reviewResponse }) => {
  const isPositiveDecision =
    reviewResponse?.decision === ReviewResponseDecision.Agree ||
    reviewResponse?.decision === ReviewResponseDecision.Approve

  const decisionClass = isPositiveDecision ? 'positive-decision' : 'negative-decision'

  return (
    <div className={`decision-container ${decisionClass}`}>
      <p className="secondary reviewer-name">
        {reviewResponse.review?.reviewer?.firstName} {reviewResponse.review?.reviewer?.lastName}
      </p>

      <h5 className="decision">{getDecisionString(isPositiveDecision, isConsolidation)}</h5>
      <p className="secondary date-indicator">
        <strong>{getSimplifiedTimeDifference(reviewResponse.timeUpdated)}</strong>
      </p>
    </div>
  )
}

export default DecisionLabel
