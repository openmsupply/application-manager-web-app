import React, { useState } from 'react'
import { Button, Form, Header, Modal, Radio, Segment, TextArea } from 'semantic-ui-react'
import { useRouter } from '../../utils/hooks/useRouter'
import { ReviewResponse, ReviewResponseDecision } from '../../utils/generated/graphql'
import strings from '../../utils/constants'
import messages from '../../utils/messages'
import SummaryViewWrapper from '../../formElementPlugins/SummaryViewWrapper'
import { SummaryViewWrapperProps } from '../../formElementPlugins/types'
import useUpdateReviewResponse from '../../utils/hooks/useUpdateReviewResponse'

interface HistoryPanelProps {
  summaryViewProps: SummaryViewWrapperProps
  reviewResponse: ReviewResponse
  isConsolidation: boolean
}

const DecisionArea: React.FC<HistoryPanelProps> = ({
  summaryViewProps,
  reviewResponse: initialReviewResponse,
  isConsolidation,
}) => {
  const {
    query: { showHistory },
    updateQuery,
  } = useRouter()
  const [reviewResponse, setReviewResponse] = useState(initialReviewResponse)

  return (
    <Modal
      closeIcon
      open={!!showHistory}
      onClose={() => {
        updateQuery({ showHistory: null })
      }}
      size="fullscreen"
      style={{ margin: 0, background: 'transparent' }} // TODO: Move style to overrides
    >
      <div id="review-decision-container">
        <div id="review-decision-content">
          <div id="document-viewer" className="hidden-element">
            TO-DO: DOCUMENT VIEWER
          </div>
          <div id="details-panel">
            <Form>
              <Segment basic>
                <Header as="h3">{strings.TITLE_DETAILS}</Header>
                <SummaryViewWrapper {...summaryViewProps} />
              </Segment>
              <Segment basic>
                <Form.Field>
                  <strong>
                    {isConsolidation ? strings.LABEL_CONSOLIDATE : strings.LABEL_REVIEW}
                  </strong>
                </Form.Field>
              </Segment>
              {/* TO-DO: HISTORY PANEL */}
              <Segment basic id="history-panel">
                <p>
                  <em>History panel goes here</em>
                </p>
              </Segment>
            </Form>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default DecisionArea
