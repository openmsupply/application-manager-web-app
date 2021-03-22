import React, { useEffect, useState } from 'react'
import { Button, Header, Modal, Radio, Segment, TextArea } from 'semantic-ui-react'
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'

interface DecisionAreaProps {
  toggle: boolean
  newFile: string
}

const options = {
  cMapUrl: 'cmaps/',
  cMapPacked: true,
}

const PreviewModal: React.FC<DecisionAreaProps> = ({ toggle, newFile }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [previousToggle, setPreviousToggle] = useState(false)

  const [file, setFile] = useState('http://localhost:8080/file?uid=I3hobW7Vl5heikY6yz5T0')
  const [numPages, setNumPages] = useState(null)

  useEffect(() => {
    if (toggle != previousToggle) {
      setPreviousToggle(toggle)
      setIsOpen(true)
    }
  }, [toggle])

  useEffect(() => {
    setFile(newFile)
  }, [newFile])

  // const [file, setFile] = useState('http://localhost:8080/file?uid=d2yHe0ZmsTcWSOi4Cmtz7')

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
              height: '100vh',
              width: '80vw',
              display: 'flex',
              overflow: 'scroll',
              justifyContent: 'center',
            }}
          >
            <Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options}>
              {Array.from(new Array(numPages), (el, index) => (
                <Page key={`page_${index + 1}`} scale={2} pageNumber={index + 1} />
              ))}
            </Document>
            {/* */}
          </div>
          <a
            style={{ position: 'fixed', top: 0, right: 0, color: 'rgb(240,240,240)', fontSize: 20 }}
            href={file}
            target="_blank"
          >
            Open File In New Tab
          </a>
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

export default PreviewModal
