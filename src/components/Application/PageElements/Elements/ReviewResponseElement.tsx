import React, { CSSProperties, useState } from 'react'
import { Button, Grid } from 'semantic-ui-react'
import { SummaryViewWrapper } from '../../../../formElementPlugins'
import { SummaryViewWrapperProps } from '../../../../formElementPlugins/types'
import {
  ApplicationResponse,
  ReviewResponse,
  ReviewResponseStatus,
} from '../../../../utils/generated/graphql'
import DecisionArea from '../../../Review/DecisionArea'
import strings from '../../../../utils/constants'

interface ReviewResponseElementProps {
  isNewApplicationResponse: boolean
  latestApplicationResponse: ApplicationResponse
  thisReviewLatestResponse?: ReviewResponse
  summaryProps: SummaryViewWrapperProps
}

const ReviewResponseElement: React.FC<ReviewResponseElementProps> = ({
  isNewApplicationResponse,
  thisReviewLatestResponse,
  summaryProps,
}) => {
  const decisionArea = useState(false)
  const [toggle] = decisionArea

  return (
    <>
      <Grid columns="equal">
        <Grid.Column floated="left" width={4}>
          <SummaryViewWrapper {...summaryProps} />
        </Grid.Column>
        <Grid.Column floated="right" textAlign="right">
          {thisReviewLatestResponse &&
            thisReviewLatestResponse.status === ReviewResponseStatus.Draft &&
            !thisReviewLatestResponse.decision && (
              <ReviewButton
                isNewApplicationResponse={isNewApplicationResponse}
                decisionArea={decisionArea}
              />
            )}
        </Grid.Column>
      </Grid>
      {thisReviewLatestResponse && (
        <DecisionArea
          reviewResponse={thisReviewLatestResponse as ReviewResponse}
          toggle={toggle}
          summaryViewProps={summaryProps}
        />
      )}
    </>
  )
}

const ReviewButton: React.FC<{
  isNewApplicationResponse?: boolean
  decisionArea: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
}> = ({ isNewApplicationResponse, decisionArea: [toggleDecisionArea, setToggleDecisionArea] }) => (
  <Button
    content={
      isNewApplicationResponse ? strings.BUTTON_RE_REVIEW_RESPONSE : strings.BUTTON_REVIEW_RESPONSE
    }
    size="small"
    style={buttonStyle}
    onClick={() => setToggleDecisionArea(!toggleDecisionArea)}
  />
)

// Styles - TODO: Move to LESS || Global class style (semantic)
const buttonStyle = {
  letterSpacing: 0.8,
  fontWeight: 1000,
  fontSize: 17,
  background: 'none',
  color: '#003BFE',
  border: 'none',
  borderRadius: 8,
  textTransform: 'capitalize',
} as CSSProperties

export default ReviewResponseElement
