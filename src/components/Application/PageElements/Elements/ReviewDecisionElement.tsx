import React, { useState, CSSProperties } from 'react'
import { Icon, Label } from 'semantic-ui-react'
import { SummaryViewWrapperProps } from '../../../../formElementPlugins/types'
import getSimplifiedTimeDifference from '../../../../utils/dateAndTime/getSimplifiedTimeDifference'
import {
  ApplicationResponse,
  ReviewResponse,
  ReviewResponseDecision,
  ReviewResponseStatus,
} from '../../../../utils/generated/graphql'
import DecisionArea from '../../../Review/DecisionArea'
import strings from '../../../../utils/constants'

interface ReviewDecisionElementProps {
  latestApplicationResponse: ApplicationResponse
  reviewResponse: ReviewResponse
  summaryViewProps: SummaryViewWrapperProps
}

const ReviewDecisionElement: React.FC<ReviewDecisionElementProps> = ({
  reviewResponse,
  summaryViewProps,
  latestApplicationResponse,
}) => {
  const [toggleDecisionArea, setToggleDecisionArea] = useState(false)

  if (!reviewResponse) return null
  if (!reviewResponse?.decision) return null

  // After review is submitted, reviewResponses are trimmed if they are not changed duplicates
  // or if they are null, we only want to show reviewResponses that are linked to latestApplicationResponse
  if (latestApplicationResponse.id !== reviewResponse.applicationResponse?.id) return null

  return (
    <div style={reviewCommentStyle.top}>
      <div style={reviewCommentStyle.reviewer}>
        {reviewResponse.review?.reviewer?.firstName} {reviewResponse.review?.reviewer?.lastName}
      </div>
      <div style={reviewCommentStyle.body}>
        <div style={reviewCommentStyle.decision}>
          <Icon
            name="circle"
            size="tiny"
            color={reviewResponse?.decision === ReviewResponseDecision.Approve ? 'green' : 'red'}
          />
          <Label style={reviewStatusStyle}>
            {reviewResponse?.decision === ReviewResponseDecision.Approve
              ? strings.LABEL_REVIEW_DECICION_CONFORM
              : strings.LABEL_REVIEW_DECISION_NON_CONFORM}
          </Label>
          <Label style={datePaddingStyle} size="mini">
            {getSimplifiedTimeDifference(reviewResponse.timeUpdated)}
          </Label>
        </div>
        {!reviewResponse.comment ? null : (
          <div style={reviewCommentStyle.comment}>
            <Icon name="comment alternate outline" color="grey" />
            <div>{reviewResponse.comment}</div>
          </div>
        )}
      </div>
      {reviewResponse.status === ReviewResponseStatus.Draft && (
        <Icon name="edit" color="blue" onClick={() => setToggleDecisionArea(!toggleDecisionArea)} />
      )}
      <DecisionArea
        reviewResponse={reviewResponse}
        toggle={toggleDecisionArea}
        summaryViewProps={summaryViewProps}
      />
    </div>
  )
}

// Styles - TODO: Move to LESS || Global class style (semantic)

const reviewCommentStyle = {
  top: {
    display: 'flex',
    background: 'rgb(249, 255, 255)',
    margin: 10,
    marginTop: 0,
    borderTop: '3px solid rgb(230, 230, 230)',
    borderBottom: '3px solid rgb(230, 230, 230)',
    padding: 14,
  } as CSSProperties,
  reviewer: { color: 'rgb(150, 150, 150)', marginRight: 20 } as CSSProperties,
  body: {
    flexGrow: 1,
    textAlign: 'left',
  } as CSSProperties,
  decision: { display: 'flex', alignItems: 'center' },
  comment: {
    color: 'grey',
    display: 'flex',
    margin: 6,
  } as CSSProperties,
}
const reviewStatusStyle = {
  background: 'transparent',
  fontWeight: 'bolder',
  fontSize: 16,
  marginRight: 10,
} as CSSProperties
const datePaddingStyle = { padding: 6 } as CSSProperties

export default ReviewDecisionElement
