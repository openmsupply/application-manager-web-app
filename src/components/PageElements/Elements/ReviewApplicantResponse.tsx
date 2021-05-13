import React from 'react'
import { Icon } from 'semantic-ui-react'
import { SummaryViewWrapperProps } from '../../../formElementPlugins/types'
import { ApplicationResponse, ReviewResponse } from '../../../utils/generated/graphql'
import ApplicantResponseElement from './ApplicantResponseElement'
import ReviewResponseElement from './ReviewResponseElement'
import strings from '../../../utils/constants'

interface ReviewApplicantResponseProps {
  isNewApplicationResponse: boolean
  applicationResponse: ApplicationResponse
  summaryViewProps: SummaryViewWrapperProps
  reviewResponse: ReviewResponse
  showModal: () => void
}

const ReviewApplicantResponse: React.FC<ReviewApplicantResponseProps> = ({
  isNewApplicationResponse,
  applicationResponse,
  summaryViewProps,
  reviewResponse,
  showModal,
}) => {
  const decisionExists = !!reviewResponse?.decision

  return (
    <div>
      {/* Application Response */}
      <ApplicantResponseElement
        applicationResponse={applicationResponse}
        summaryViewProps={summaryViewProps}
      >
        {!decisionExists && (
          <ReviewElementTrigger
            title={
              isNewApplicationResponse /* can add check for isNewReviewResponseAlso */
                ? strings.BUTTON_RE_REVIEW_RESPONSE
                : strings.BUTTON_REVIEW_RESPONSE
            }
            onClick={showModal}
          />
        )}
      </ApplicantResponseElement>
      {/* Review Response */}
      <ReviewResponseElement
        isCurrentReview={true}
        isConsolidation={false}
        isNewApplicationResponse={isNewApplicationResponse}
        applicationResponse={applicationResponse}
        reviewResponse={reviewResponse}
      >
        {decisionExists && <UpdateIcon onClick={showModal} />}
      </ReviewResponseElement>
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

export default ReviewApplicantResponse