import React, { useEffect, useState } from 'react'
import { Button, Header, Modal, Radio, Segment, TextArea } from 'semantic-ui-react'

import { ReviewResponse, ReviewResponseDecision } from '../../utils/generated/graphql'
import strings from '../../utils/constants'
import messages from '../../utils/messages'
import SummaryViewWrapper from '../../formElementPlugins/SummaryViewWrapper'
import { SummaryViewWrapperProps } from '../../formElementPlugins/types'
import useUpdateReviewResponse from '../../utils/hooks/useUpdateReviewResponse'

interface DecisionAreaProps {
  reviewResponse: ReviewResponse
  toggle: boolean
  summaryViewProps: SummaryViewWrapperProps
}

const DecisionArea: React.FC<DecisionAreaProps> = ({
  toggle,
  reviewResponse,
  summaryViewProps,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [previousToggle, setPreviousToggle] = useState(false)
  const [review, setReview] = useState(reviewResponse)
  const updateResponse = useUpdateReviewResponse(reviewResponse.id)

  useEffect(() => {
    if (toggle != previousToggle) {
      setReview(reviewResponse)
      setPreviousToggle(toggle)
      setIsOpen(true)
    }
  }, [toggle])

  const submit = async () => {
    // TODO do we need to handle update error ?
    await updateResponse(review)
    setIsOpen(false)
  }

  return (
    <Modal
      closeIcon
      open={isOpen}
      onClose={() => setIsOpen(false)}
      size="fullscreen"
      style={{ margin: 0, background: 'transparent' }}
    >
      {!isOpen ? null : (
        <Segment
          floated="right"
          style={{
            backgroundColor: 'white',
            height: '100vh',
            width: '300px',
          }}
        >
          <Segment basic>
            <Header>{strings.TITLE_DETAILS}</Header>
            <SummaryViewWrapper {...summaryViewProps} />
          </Segment>
          <Segment basic>
            <Header as="h3">{strings.LABEL_REVIEW}</Header>
            {/* // TODO: Change to list options dynamically? */}
            <Radio
              label={strings.LABEL_REVIEW_APPROVE}
              value={strings.LABEL_REVIEW_APPROVE}
              name="decisionGroup"
              checked={review.decision === ReviewResponseDecision.Approve}
              onChange={() =>
                setReview({
                  ...review,
                  decision: ReviewResponseDecision.Approve,
                })
              }
            />
            <Radio
              label={strings.LABEL_REVIEW_RESSUBMIT}
              value={strings.LABEL_REVIEW_RESSUBMIT}
              name="decisionGroup"
              checked={review.decision === ReviewResponseDecision.Decline}
              onChange={() =>
                setReview({
                  ...review,
                  decision: ReviewResponseDecision.Decline,
                })
              }
            />
          </Segment>
          <Segment basic>
            <Header as="h3">{strings.LABEL_COMMENT}</Header>
            <TextArea
              rows={6}
              style={{ width: '100%' }}
              defaultValue={review.comment}
              onChange={(_, { value }) => setReview({ ...review, comment: String(value) })}
            />
          </Segment>
          <Segment basic>
            <Button
              color="blue"
              basic
              onClick={submit}
              disabled={
                !review.decision ||
                (review.decision === ReviewResponseDecision.Decline && !review.comment)
              }
              content={strings.BUTTON_SUBMIT}
            />
            {review.decision === ReviewResponseDecision.Decline && !review.comment && (
              <p style={{ color: 'red' }}>{messages.REVIEW_RESUBMIT_COMMENT}</p>
            )}
          </Segment>
        </Segment>
      )}
    </Modal>
  )
}

export default DecisionArea
