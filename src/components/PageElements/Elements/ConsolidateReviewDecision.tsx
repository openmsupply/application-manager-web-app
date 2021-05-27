import React from 'react'
import { SummaryViewWrapperProps } from '../../../formElementPlugins/types'
import { ApplicationResponse, ReviewResponse } from '../../../utils/generated/graphql'
import ApplicantResponseElement from './ApplicantResponseElement'
import ReviewResponseElement from './ReviewResponseElement'
import strings from '../../../utils/constants'
import { Icon } from 'semantic-ui-react'

interface ConsolidateReviewDecisionProps {
  applicationResponse: ApplicationResponse
  summaryViewProps: SummaryViewWrapperProps
  isActiveReviewResponse: boolean
  isNewApplicationResponse: boolean
  /* can add check for isNewReviewResponse */
  reviewResponse?: ReviewResponse
  originalReviewResponse?: ReviewResponse
  showModal: () => void
}
const ConsolidateReviewDecision: React.FC<ConsolidateReviewDecisionProps> = ({
  applicationResponse,
  summaryViewProps,
  isActiveReviewResponse,
  isNewApplicationResponse,
  reviewResponse,
  originalReviewResponse,
  showModal,
}) => {
  const isConsolidation = true
  const decisionExists = !!reviewResponse?.decision

  return (
    <div>
      {/* Application Response */}
      <ApplicantResponseElement
        applicationResponse={applicationResponse}
        summaryViewProps={summaryViewProps}
      />
      {/* Consolidation Response */}
      {reviewResponse && (
        <ReviewResponseElement
          isCurrentReview={true}
          isConsolidation={isConsolidation}
          applicationResponse={applicationResponse}
          reviewResponse={reviewResponse}
          originalReviewResponse={originalReviewResponse}
        >
          {isActiveReviewResponse && decisionExists && <UpdateIcon onClick={showModal} />}
        </ReviewResponseElement>
      )}
      {/* Review Response */}
      {originalReviewResponse && (
        <ReviewResponseElement
          isCurrentReview={false}
          isConsolidation={false}
          applicationResponse={applicationResponse}
          reviewResponse={originalReviewResponse}
        >
          {isActiveReviewResponse && !decisionExists && (
            <ReviewElementTrigger title={strings.BUTTON_REVIEW_RESPONSE} onClick={showModal} />
          )}
        </ReviewResponseElement>
      )}
    </div>
  )
}

const ReviewElementTrigger: React.FC<{ title: string; onClick: () => void }> = ({
  title,
  onClick,
}) => (
  <p className="link-style clickable" onClick={onClick}>
    <strong>{title}</strong>
  </p>
)

const UpdateIcon: React.FC<{ onClick: Function }> = ({ onClick }) => (
  <Icon className="clickable" name="pencil" size="large" color="blue" onClick={onClick} />
)

export default ConsolidateReviewDecision
