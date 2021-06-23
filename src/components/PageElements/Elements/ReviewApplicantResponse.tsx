import React, { useState } from 'react'
import { SummaryViewWrapperProps } from '../../../formElementPlugins/types'
import { ApplicationResponse, ReviewResponse } from '../../../utils/generated/graphql'
import ApplicantResponseElement from './ApplicantResponseElement'
import ReviewResponseElement from './ReviewResponseElement'
import ReviewInlineInput from './ReviewInlineInput'
import strings from '../../../utils/constants'
import { UpdateIcon } from '../PageElements'
import ViewHistoryButton from '../ViewHistoryButton'

type ReviewType =
  | 'NotReviewable'
  | 'FirstReviewApplication'
  | 'UpdateChangesRequested'
  | 'ReReviewApplication' // 'Consolidation' is done in separated component

interface ReviewApplicantResponseProps {
  applicationResponse: ApplicationResponse
  summaryViewProps: SummaryViewWrapperProps
  reviewResponse?: ReviewResponse
  previousReviewResponse?: ReviewResponse
  isActiveReviewResponse: boolean
  isNewApplicationResponse: boolean
  enableViewHistory: boolean
  isChangeRequest: boolean
  isChanged: boolean
  showModal: () => void
}

const ReviewApplicantResponse: React.FC<ReviewApplicantResponseProps> = ({
  applicationResponse,
  summaryViewProps,
  reviewResponse,
  previousReviewResponse,
  isNewApplicationResponse,
  isActiveReviewResponse,
  enableViewHistory,
  isChangeRequest,
  isChanged,
  showModal,
}) => {
  const [isActiveEdit, setIsActiveEdit] = useState(false)
  const decisionExists = !!reviewResponse?.decision
  const triggerTitle = isNewApplicationResponse
    ? strings.BUTTON_RE_REVIEW_RESPONSE
    : strings.BUTTON_REVIEW_RESPONSE

  const consolidationReviewResponse = previousReviewResponse?.reviewResponsesByReviewResponseLinkId
    .nodes[0] as ReviewResponse // There is only one reviewResponse associated per review cycle

  const reviewType: ReviewType = isNewApplicationResponse
    ? 'ReReviewApplication'
    : isChangeRequest
    ? 'UpdateChangesRequested'
    : isActiveReviewResponse
    ? 'FirstReviewApplication'
    : 'NotReviewable'

  const getReviewDecisionOption = () => {
    if (isActiveReviewResponse && isChangeRequest && !isChanged)
      return (
        <ReviewElementTrigger
          title={strings.LABEL_RESPONSE_UPDATE}
          onClick={() => setIsActiveEdit(true)}
        />
      )
    return null
  }

  switch (reviewType) {
    case 'UpdateChangesRequested':
      return (
        <>
          {/* Applicant Response */}
          <ApplicantResponseElement
            applicationResponse={applicationResponse}
            summaryViewProps={summaryViewProps}
          />
          {isActiveEdit ? (
            /* Inline Review area + Consolidation in context*/
            <div className="blue-border">
              <ReviewResponseElement
                isCurrentReview={false}
                isConsolidation={true}
                reviewResponse={consolidationReviewResponse}
                shouldDim={isChangeRequest && isChanged}
              />
              <ReviewInlineInput
                setIsActiveEdit={setIsActiveEdit}
                reviewResponse={reviewResponse as ReviewResponse}
                isConsolidation={false}
              />
            </div>
          ) : (
            <>
              {/* Consolidation Response (in cronological order) */}
              {isChangeRequest && isChanged && (
                <ReviewResponseElement
                  isCurrentReview={true}
                  isConsolidation={false}
                  reviewResponse={reviewResponse}
                >
                  {isActiveReviewResponse && <UpdateIcon onClick={() => setIsActiveEdit(true)} />}
                </ReviewResponseElement>
              )}
              {consolidationReviewResponse && (
                <ReviewResponseElement
                  isCurrentReview={false}
                  isConsolidation={true}
                  reviewResponse={consolidationReviewResponse}
                  shouldDim={isChanged}
                />
              )}
              {!isChanged && (
                <ReviewResponseElement
                  isCurrentReview={true}
                  isConsolidation={false}
                  reviewResponse={previousReviewResponse}
                >
                  {getReviewDecisionOption()}
                </ReviewResponseElement>
              )}
            </>
          )}
          {/* Show history - for previous reviews done */}
          {enableViewHistory && <ViewHistoryButton />}
        </>
      )

    case 'ReReviewApplication':
    case 'FirstReviewApplication':
      return (
        <>
          {isActiveEdit ? (
            /* Inline Review area + Applicant response in context*/
            <div className="blue-border">
              <ApplicantResponseElement
                applicationResponse={applicationResponse}
                summaryViewProps={summaryViewProps}
              />
              <ReviewInlineInput
                setIsActiveEdit={setIsActiveEdit}
                reviewResponse={reviewResponse as ReviewResponse}
                isConsolidation={false}
              />
            </div>
          ) : (
            <>
              {/* Application Response */}
              <ApplicantResponseElement
                applicationResponse={applicationResponse}
                summaryViewProps={summaryViewProps}
              >
                {!decisionExists && (
                  <ReviewElementTrigger
                    title={triggerTitle} // Review or Re-review
                    onClick={() => setIsActiveEdit(true)}
                  />
                )}
              </ApplicantResponseElement>
              {/* Current review response */}
              {decisionExists && (
                <ReviewResponseElement
                  isCurrentReview={true}
                  isConsolidation={false}
                  reviewResponse={reviewResponse}
                >
                  {isActiveReviewResponse && <UpdateIcon onClick={() => setIsActiveEdit(true)} />}
                </ReviewResponseElement>
              )}
              {/* Previous review response */}
              {isNewApplicationResponse && !decisionExists && (
                <ReviewResponseElement
                  isCurrentReview={false}
                  isConsolidation={false}
                  reviewResponse={previousReviewResponse}
                />
              )}
            </>
          )}
          {/* Show history - for previous reviews done */}
          {enableViewHistory && <ViewHistoryButton />}
        </>
      )
    default:
      // 'NotReviewable'
      return (
        <ApplicantResponseElement
          applicationResponse={applicationResponse}
          summaryViewProps={summaryViewProps}
        />
      )
  }
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

export default ReviewApplicantResponse
