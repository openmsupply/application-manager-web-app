import React, { useState } from 'react'
import { Button, Form, Radio, TextArea } from 'semantic-ui-react'
import strings from '../../../utils/constants'
import { ReviewResponse, ReviewResponseDecision } from '../../../utils/generated/graphql'
import useUpdateReviewResponse from '../../../utils/hooks/useUpdateReviewResponse'

const optionsMap = {
  consolidation: [
    {
      label: strings.LABEL_CONSOLIDATION_AGREE,
      decision: ReviewResponseDecision.Agree,
    },
    {
      label: strings.LABEL_CONSOLIDATION_DISAGREE,
      decision: ReviewResponseDecision.Disagree,
    },
  ],
  review: [
    {
      label: strings.LABEL_REVIEW_APPROVE,
      decision: ReviewResponseDecision.Approve,
    },
    {
      label: strings.LABEL_REVIEW_RESSUBMIT,
      decision: ReviewResponseDecision.Decline,
    },
  ],
}

interface ReviewInlineInputProps {
  setIsActiveEdit: (_: boolean) => void
  reviewResponse: ReviewResponse
  isConsolidation: boolean
}

const ReviewInlineInput: React.FC<ReviewInlineInputProps> = ({
  setIsActiveEdit,
  reviewResponse: initialReviewResponse,
  isConsolidation,
}) => {
  const [reviewResponse, setReviewResponse] = useState(initialReviewResponse)
  const updateResponse = useUpdateReviewResponse()

  const options = isConsolidation ? optionsMap.consolidation : optionsMap.review

  const submit = async () => {
    // TODO do we need to handle update error ?
    await updateResponse(reviewResponse)
    setIsActiveEdit(false)
  }

  const isInvalidComment =
    (!reviewResponse.comment || reviewResponse.comment?.trim() === '') &&
    (isConsolidation
      ? reviewResponse?.decision === ReviewResponseDecision.Disagree
      : reviewResponse?.decision === ReviewResponseDecision.Decline)

  return (
    <div className="response-container changeable-background">
      <div className="response-element-content">
        <Form>
          <Form.Field>
            <label>{isConsolidation ? strings.LABEL_CONSOLIDATE : strings.LABEL_REVIEW}</label>
          </Form.Field>
          {options.map(({ decision, label }) => (
            <Form.Field key={decision}>
              <Radio
                label={label}
                value={decision}
                name="decisionGroup"
                checked={reviewResponse.decision === decision}
                onChange={() =>
                  setReviewResponse({
                    ...reviewResponse,
                    decision: decision,
                  })
                }
              />
            </Form.Field>
          ))}
          <Form.Field>
            <label>{strings.LABEL_COMMENT}</label>
          </Form.Field>
          <Form.Field>
            <TextArea
              rows={4}
              defaultValue={reviewResponse.comment}
              onChange={(_, { value }) =>
                setReviewResponse({ ...reviewResponse, comment: String(value) })
              }
            />
          </Form.Field>
          <div className="review-button-container">
            <Button
              primary
              disabled={isInvalidComment}
              content={strings.BUTTON_ADD_REVIEW}
              onClick={submit}
              className="button-med"
            />
            <Button
              primary
              inverted
              content={strings.BUTTON_CANCEL}
              onClick={() => setIsActiveEdit(false)}
              className="button-med"
            />
          </div>
        </Form>
      </div>
    </div>
  )
}

export default ReviewInlineInput
