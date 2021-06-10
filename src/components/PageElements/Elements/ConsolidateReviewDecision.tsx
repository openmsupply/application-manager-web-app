import React, { useState } from 'react'
import { SummaryViewWrapperProps } from '../../../formElementPlugins/types'
import { ApplicationResponse, ReviewResponse } from '../../../utils/generated/graphql'
import ApplicantResponseElement from './ApplicantResponseElement'
import ReviewResponseElement from './ReviewResponseElement'
import ReviewInlineInput from './ReviewInlineInput'
import strings from '../../../utils/constants'
import { UpdateIcon } from '../PageElements'

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
  reviewResponse,
  originalReviewResponse,
  showModal,
}) => {
  const [isActiveEdit, setIsActiveEdit] = useState(false)
  const isConsolidation = true
  const decisionExists = !!reviewResponse?.decision

  return (
    <>
      {/* Application Response */}
      <ApplicantResponseElement
        applicationResponse={applicationResponse}
        summaryViewProps={summaryViewProps}
      />
      {/* Inline Review area */}
      {isActiveEdit && (
        <ReviewInlineInput
          setIsActiveEdit={setIsActiveEdit}
          reviewResponse={reviewResponse as ReviewResponse}
          isConsolidation={isConsolidation}
        />
      )}
      {/* Consolidation Response */}
      {decisionExists && !isActiveEdit && (
        <ReviewResponseElement
          isCurrentReview={true}
          isConsolidation={isConsolidation}
          reviewResponse={
            reviewResponse as ReviewResponse /* Casting to ReviewResponse since decision would exist if reviewResponse is defined */
          }
        >
          {isActiveReviewResponse && <UpdateIcon onClick={() => setIsActiveEdit(true)} />}
        </ReviewResponseElement>
      )}
      {/* Review Response */}
      {originalReviewResponse && (
        <ReviewResponseElement
          isCurrentReview={false}
          isConsolidation={false}
          reviewResponse={originalReviewResponse}
        >
          {isActiveReviewResponse && !decisionExists && (
            <ReviewElementTrigger
              title={strings.BUTTON_REVIEW_RESPONSE}
              onClick={() => setIsActiveEdit(true)}
            />
          )}
        </ReviewResponseElement>
      )}
    </>
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

export default ConsolidateReviewDecision
