import React, { useState } from 'react'
import { SummaryViewWrapperProps } from '../../../formElementPlugins/types'
import { ApplicationResponse, ReviewResponse } from '../../../utils/generated/graphql'
import ApplicantResponseElement from './ApplicantResponseElement'
import ReviewResponseElement from './ReviewResponseElement'
import ReviewInlineInput from './ReviewInlineInput'
import strings from '../../../utils/constants'
import { UpdateIcon } from '../PageElements'
import ViewHistoryButton from '../ViewHistoryButton'

interface ConsolidateReviewDecisionProps {
  elementCode: string
  applicationResponse: ApplicationResponse
  summaryViewProps: SummaryViewWrapperProps
  isActiveReviewResponse: boolean
  isNewReviewResponse: boolean
  enableViewHistory: boolean
  stageNumber: number
  reviewResponse?: ReviewResponse
  previousReviewResponse?: ReviewResponse
  originalReviewResponse?: ReviewResponse
}
const ConsolidateReviewDecision: React.FC<ConsolidateReviewDecisionProps> = ({
  elementCode,
  applicationResponse,
  summaryViewProps,
  isActiveReviewResponse,
  isNewReviewResponse,
  enableViewHistory,
  stageNumber,
  reviewResponse,
  previousReviewResponse,
  originalReviewResponse,
}) => {
  const [isActiveEdit, setIsActiveEdit] = useState(false)
  const isConsolidation = true
  const decisionExists = !!reviewResponse?.decision

  const triggerTitle = isNewReviewResponse
    ? strings.BUTTON_RE_REVIEW_RESPONSE
    : strings.BUTTON_REVIEW_RESPONSE

  return (
    <>
      {/* Applicant Response */}
      <ApplicantResponseElement
        applicationResponse={applicationResponse}
        summaryViewProps={summaryViewProps}
      />
      {isActiveEdit ? (
        /* Inline Review area + Review response in context*/
        <div className="blue-border">
          <ReviewResponseElement
            isCurrentReview={false}
            isConsolidation={false}
            reviewResponse={originalReviewResponse as ReviewResponse}
          />
          <ReviewInlineInput
            setIsActiveEdit={setIsActiveEdit}
            reviewResponse={reviewResponse as ReviewResponse}
            isConsolidation={isConsolidation}
            stageNumber={stageNumber}
          />
        </div>
      ) : (
        <>
          {/* Current consolidator review response */}
          {decisionExists && (
            <ReviewResponseElement
              isCurrentReview={true}
              isConsolidation={true}
              reviewResponse={reviewResponse}
            >
              {isActiveReviewResponse && <UpdateIcon onClick={() => setIsActiveEdit(true)} />}
            </ReviewResponseElement>
          )}
          {/* Lower level Review Response */}
          <ReviewResponseElement
            isCurrentReview={false}
            isConsolidation={false}
            reviewResponse={originalReviewResponse as ReviewResponse}
          >
            {!decisionExists && (
              <ReviewElementTrigger
                title={triggerTitle} // Review or Re-review
                onClick={() => setIsActiveEdit(true)}
              />
            )}
          </ReviewResponseElement>
        </>
      )}
      {/* Previous Consolidation Response */}
      {isNewReviewResponse && !decisionExists && (
        <ReviewResponseElement
          isCurrentReview={false}
          isConsolidation={isConsolidation}
          reviewResponse={previousReviewResponse}
        />
      )}
      {/* Show history - for previous consolidations done */}
      {enableViewHistory && <ViewHistoryButton elementCode={elementCode} />}
    </>
  )
}

// TODO: Unify code with other ReviewElementTrigger
const ReviewElementTrigger: React.FC<{ title: string; onClick: () => void }> = ({
  title,
  onClick,
}) => (
  <p className="link-style clickable" onClick={onClick}>
    <strong>{title}</strong>
  </p>
)

export default ConsolidateReviewDecision
