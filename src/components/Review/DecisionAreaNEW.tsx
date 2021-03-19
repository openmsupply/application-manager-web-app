import React, { useEffect, useState } from 'react'
import { Button, Header, Modal, Radio, Segment, TextArea } from 'semantic-ui-react'
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'

import { ReviewResponse, ReviewResponseDecision } from '../../utils/generated/graphql'
import strings from '../../utils/constants'
import messages from '../../utils/messages'
import SummaryViewWrapperNEW from '../../formElementPlugins/SummaryViewWrapperNEW'
import { SummaryViewWrapperPropsNEW } from '../../formElementPlugins/types'
import useUpdateReviewResponse from '../../utils/hooks/useUpdateReviewResponseNEW'

interface DecisionAreaProps {
  reviewResponse: ReviewResponse
  toggle: boolean
  summaryViewProps: SummaryViewWrapperPropsNEW
}

const options = {
  cMapUrl: 'cmaps/',
  cMapPacked: true,
}

const DecisionAreaNEW: React.FC<DecisionAreaProps> = ({
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
  // const [file, setFile] = useState('http://localhost:8080/file?uid=d2yHe0ZmsTcWSOi4Cmtz7')

  const [file, setFile] = useState('http://localhost:8080/file?uid=28ANIZa2sx690RrsXKHuC')
  const [numPages, setNumPages] = useState(null)

  function onFileChange(event) {
    setFile(event.target.files[0])
  }

  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages)
  }

  return (
    <Modal
      closeIcon
      open={isOpen}
      centered={false}
      onClose={() => setIsOpen(false)}
      size="fullscreen"
      style={{ margin: 0, background: 'transparent' }}
    >
      {!isOpen ? null : (
        <>
          <div
            style={{
              position: 'fixed',
              top: '0px',
              left: '0px',
              right: '0px',
              height: '70vh',
              width: '95vw',
              background: 'blue',
              overflow: 'scroll',
              alignItems: 'center',
            }}
          >
            <Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options}>
              {Array.from(new Array(numPages), (el, index) => (
                <Page key={`page_${index + 1}`} scale={2} pageNumber={index + 1} />
              ))}
            </Document>
            {/* */}
          </div>
          <div
            style={{
              position: 'fixed',
              top: '70vh',
              left: '0px',
              right: '0px',
              height: '30vh',
              width: '95vw',
              background: 'green',
            }}
          ></div>
        </>
        // <Segment
        //   floated="right"
        //   style={{
        //     backgroundColor: 'white',
        //     height: '100vh',
        //     width: '300px',
        //   }}
        // >
        //   <Segment basic>
        //     <Header>{strings.TITLE_DETAILS}</Header>
        //     <SummaryViewWrapperNEW {...summaryViewProps} />
        //   </Segment>
        //   <Segment basic>
        //     <Header as="h3">{strings.LABEL_REVIEW}</Header>
        //     {/* // TODO: Change to list options dynamically? */}
        //     <Radio
        //       label={strings.LABEL_REVIEW_APPROVE}
        //       value={strings.LABEL_REVIEW_APPROVE}
        //       name="decisionGroup"
        //       checked={review.decision === ReviewResponseDecision.Approve}
        //       onChange={() =>
        //         setReview({
        //           ...review,
        //           decision: ReviewResponseDecision.Approve,
        //         })
        //       }
        //     />
        //     <Radio
        //       label={strings.LABEL_REVIEW_RESSUBMIT}
        //       value={strings.LABEL_REVIEW_RESSUBMIT}
        //       name="decisionGroup"
        //       checked={review.decision === ReviewResponseDecision.Decline}
        //       onChange={() =>
        //         setReview({
        //           ...review,
        //           decision: ReviewResponseDecision.Decline,
        //         })
        //       }
        //     />
        //   </Segment>
        //   <Segment basic>
        //     <Header as="h3">{strings.LABEL_COMMENT}</Header>
        //     <TextArea
        //       rows={6}
        //       style={{ width: '100%' }}
        //       defaultValue={review.comment}
        //       onChange={(_, { value }) => setReview({ ...review, comment: String(value) })}
        //     />
        //   </Segment>
        //   <Segment basic>
        //     <Button
        //       color="blue"
        //       basic
        //       onClick={submit}
        //       disabled={
        //         !review.decision ||
        //         (review.decision === ReviewResponseDecision.Decline && !review.comment)
        //       }
        //       content={strings.BUTTON_SUBMIT}
        //     />
        //     {review.decision === ReviewResponseDecision.Decline && !review.comment && (
        //       <p style={{ color: 'red' }}>{messages.REVIEW_RESUBMIT_COMMENT}</p>
        //     )}
        //   </Segment>
        // </Segment>
      )}
    </Modal>
  )
}

export default DecisionAreaNEW
