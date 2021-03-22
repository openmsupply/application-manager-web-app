import React, { useEffect, useState } from 'react'
import { Button, Header, Modal, Radio, Segment, TextArea, Accordion, Icon } from 'semantic-ui-react'

import {
  ReviewResponse,
  ReviewResponseDecision,
  useGetAllAssociatedResponsesQuery,
} from '../../utils/generated/graphql'
import strings from '../../utils/constants'
import messages from '../../utils/messages'
import SummaryViewWrapperNEW from '../../formElementPlugins/SummaryViewWrapperNEW'
import { SummaryViewWrapperPropsNEW } from '../../formElementPlugins/types'
import useUpdateReviewResponse from '../../utils/hooks/useUpdateReviewResponseNEW'
import { QueryHookOptions } from '@apollo/client'
import getSimplifiedTimeDifference from '../../utils/dateAndTime/getSimplifiedTimeDifference'

interface DecisionAreaProps {
  reviewResponse: ReviewResponse
  toggle: boolean
  summaryViewProps: SummaryViewWrapperPropsNEW
}

const DecisionAreaNEW: React.FC<DecisionAreaProps> = ({
  toggle,
  reviewResponse,
  summaryViewProps,
  // applicationSerial,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [previousToggle, setPreviousToggle] = useState(false)
  const [review, setReview] = useState(reviewResponse)
  const updateResponse = useUpdateReviewResponse(reviewResponse.id)
  const associatedResponses = useGetAllAssociatedResponsesQuery({
    variables: { responseId: reviewResponse?.applicationResponseId || 0 },
  }).data

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

  console.log('Summary view props', summaryViewProps)

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
            minHeight: '100vh',
            width: '300px',
          }}
        >
          <Segment basic>
            <Header>{strings.TITLE_DETAILS}</Header>
            <SummaryViewWrapperNEW {...summaryViewProps} />
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
          <HistoryPanel
            responses={
              associatedResponses?.applicationResponse?.templateElement?.applicationResponses?.nodes
            }
          />
        </Segment>
      )}
    </Modal>
  )
}

export default DecisionAreaNEW

const HistoryPanel = ({ responses }: any) => {
  const [historyShow, setHistoryShow] = useState(false)

  const handleClick = () => {
    setHistoryShow(!historyShow)
  }

  return (
    <>
      {/* <Header as="h3">History</Header> */}
      <Accordion>
        <Accordion.Title active={historyShow} onClick={handleClick}>
          <Icon name="dropdown" /> History
        </Accordion.Title>
        <Accordion.Content active={historyShow}>
          {parseHistory(responses).map((response: any) => {
            if (response.type === 'ApplicationResponse')
              return (
                <p>
                  {getSimplifiedTimeDifference(response.timestamp)}
                  <br />
                  <strong>{response.text}</strong>
                </p>
              )
            else if (response.type === 'ReviewResponse')
              return (
                response.decision && (
                  <p>
                    {getSimplifiedTimeDifference(response.timestamp)}
                    <br />
                    {` • ${response.reviewer} commented:`}
                    <br />
                    <em>{response.text}</em>
                    <br />
                    <strong>{`Decision: ${response.decision}`}</strong>
                  </p>
                )
              )
          })}
        </Accordion.Content>
      </Accordion>
    </>
  )
}

const parseHistory = (responses: any) => {
  console.log('responses', JSON.stringify(responses, null, 2))
  const applicationResponses = responses.map((response: any) => ({
    text: response.value.text,
    timestamp: response.timeUpdated,
    type: 'ApplicationResponse',
  }))
  const reviewResponses: any = []
  for (const response of responses) {
    if (!response.reviewResponses) continue
    console.log(response.reviewResponses)
    for (const reviewResponse of response.reviewResponses.nodes) {
      reviewResponses.push({
        type: 'ReviewResponse',
        reviewer: reviewResponse.review.reviewer.firstName,
        text: reviewResponse.comment,
        decision: reviewResponse.decision,
        timestamp: reviewResponse.timeUpdated,
      })
    }
  }
  console.log('AppRe', applicationResponses)
  console.log('ReviewResponse', reviewResponses)

  const allResponses = [...applicationResponses, ...reviewResponses].sort(
    (a: any, b: any) => a?.timestamp - b?.timestamp
  )
  console.log(JSON.stringify(allResponses, null, 2))
  return allResponses
}
