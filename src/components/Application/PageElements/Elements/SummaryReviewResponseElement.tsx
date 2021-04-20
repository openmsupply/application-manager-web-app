import React, { CSSProperties } from 'react'
import { Icon, Label } from 'semantic-ui-react'
import { SummaryViewWrapper } from '../../../../formElementPlugins'
import { SummaryViewWrapperProps } from '../../../../formElementPlugins/types'
import getSimplifiedTimeDifference from '../../../../utils/dateAndTime/getSimplifiedTimeDifference'
import { ApplicationResponse, ReviewResponseDecision } from '../../../../utils/generated/graphql'

interface SummaryReviewResponseElementProps {
  previousApplicationResponse: ApplicationResponse
  summaryProps: SummaryViewWrapperProps
}

const SummaryReviewResponseElement: React.FC<SummaryReviewResponseElementProps> = ({
  previousApplicationResponse,
  summaryProps,
}) => {
  const reviewResponse = previousApplicationResponse.reviewResponses.nodes?.[0]

  if (!reviewResponse) return null
  if (!reviewResponse?.decision) return null

  // If review was approved we don't need to show to the Applicant
  if (reviewResponse?.decision === ReviewResponseDecision.Approve) return null

  const { element, allResponses, applicationData } = summaryProps
  const previousReviewProps = {
    element,
    allResponses,
    response: {
      id: previousApplicationResponse.id,
      text: previousApplicationResponse.value.text,
    },
    applicationData,
    displayTitle: false,
  }

  return (
    <div style={reviewCommentStyle.top}>
      <div style={reviewCommentStyle.left}>
        <Label
          style={datePaddingStyle}
          size="mini"
          content={getSimplifiedTimeDifference(reviewResponse.timeUpdated)}
        />
      </div>
      <div style={reviewCommentStyle.body}>
        <div style={reviewCommentStyle.previous}>
          <SummaryViewWrapper {...previousReviewProps} />
        </div>
        <div style={reviewCommentStyle.comment}>
          <Icon name="comment alternate outline" color="grey" />
          <div style={commentMargin}>{reviewResponse.comment || ''}</div>
        </div>
      </div>
    </div>
  )
}

// Styles - TODO: Move to LESS || Global class style (semantic)
const reviewCommentStyle = {
  top: {
    display: 'flex',
    background: '#FFFFFF',
    margin: 10,
    marginTop: 0,
    borderTop: '3px solid rgb(230, 230, 230)',
    borderBottom: '3px solid rgb(230, 230, 230)',
    padding: 14,
  } as CSSProperties,
  left: { color: 'rgb(150, 150, 150)', marginRight: 20 } as CSSProperties,
  body: {
    flexGrow: 1,
    textAlign: 'left',
  } as CSSProperties,
  previous: { display: 'flex', alignItems: 'center' },
  comment: {
    color: 'grey',
    display: 'flex',
    margin: 6,
  } as CSSProperties,
}

const commentMargin = { marginLeft: 6 } as CSSProperties
const datePaddingStyle = { padding: 6 } as CSSProperties

export default SummaryReviewResponseElement
