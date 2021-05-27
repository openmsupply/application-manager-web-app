import React, { useState } from 'react'
import { Button, Form, Label, ModalProps } from 'semantic-ui-react'
import { ModalWarning } from '../../components'
import ModalConfirmation from '../../components/Main/ModalConfirmation'
import ReviewComment from '../../components/Review/ReviewComment'
import ReviewDecision from '../../components/Review/ReviewDecision'
import strings from '../../utils/constants'
import { Decision, ReviewStatus } from '../../utils/generated/graphql'
import useGetDecisionOptions from '../../utils/hooks/useGetDecisionOptions'
import { useGetFullReviewStructureAsync } from '../../utils/hooks/useGetReviewStructureForSection'
import { useRouter } from '../../utils/hooks/useRouter'
import useSubmitReview from '../../utils/hooks/useSubmitReview'
import messages from '../../utils/messages'
import { AssignmentDetails, FullStructure } from '../../utils/types'

type ReviewSubmitProps = {
  structure: FullStructure
  assignment: AssignmentDetails
  scrollTo: (code: string) => void
}

const ReviewSubmit: React.FC<ReviewSubmitProps> = (props) => {
  const { structure } = props
  const thisReview = structure?.thisReview
  const reviewDecision = thisReview?.reviewDecision
  const { decisionOptions, getDecision, setDecision, getAndSetDecisionError, isDecisionError } =
    useGetDecisionOptions(structure.canSubmitReviewAs, thisReview)

  return (
    <Form id="review-submit-area">
      <ReviewDecision
        decisionOptions={decisionOptions}
        setDecision={setDecision}
        isDecisionError={isDecisionError}
        isEditable={thisReview?.status == ReviewStatus.Draft}
      />
      <ReviewComment
        isEditable={thisReview?.status == ReviewStatus.Draft}
        reviewDecisionId={Number(reviewDecision?.id)}
      />
      <ReviewSubmitButton
        {...props}
        getDecision={getDecision}
        getAndSetDecisionError={getAndSetDecisionError}
      />
    </Form>
  )
}

type ReviewSubmitButtonProps = {
  getDecision: () => Decision
  getAndSetDecisionError: () => boolean
}

const ReviewSubmitButton: React.FC<ReviewSubmitProps & ReviewSubmitButtonProps> = ({
  scrollTo,
  structure,
  getDecision,
  getAndSetDecisionError,
  assignment,
}) => {
  const {
    location: { pathname },
    replace,
    push,
  } = useRouter()

  // Need to refetch review status before submission, in case it's pending
  const getFullReviewStructureAsync = useGetFullReviewStructureAsync({
    fullApplicationStructure: structure,
    reviewAssignment: assignment,
  })

  const [showModalConfirmation, setShowModalConfirmation] = useState<ModalProps>({ open: false })
  const [showWarningModal, setShowWarningModal] = useState<ModalProps>({ open: false })
  // TODO: Show on message
  const [submissionError, setSubmissionError] = useState<boolean>(false)
  const submitReview = useSubmitReview(Number(structure.thisReview?.id))
  const setAttemptSubmission = () => (structure.attemptSubmission = true)
  const attemptSubmissionFailed = structure.attemptSubmission && structure.firstIncompleteReviewPage

  const showIncompleteSectionWarning = () => {
    const { title, message, option } = messages.REVIEW_DECISION_SET_FAIL
    setShowWarningModal({
      open: true,
      title,
      message,
      option,
      onClick: () => setShowWarningModal({ open: false }),
      onClose: () => setShowWarningModal({ open: false }),
    })
  }

  const showPendingReviewWarning = () => {
    const { title, message, option } = messages.REVIEW_STATUS_PENDING
    setShowWarningModal({
      open: true,
      title,
      message,
      option,
      onClick: () => {
        setShowWarningModal({ open: false })
        push(`/application/${structure.info.serial}/review`)
      },
      onClose: () => {
        setShowWarningModal({ open: false })
        push(`/application/${structure.info.serial}/review`)
      },
    })
  }

  const showConfirmation = () => {
    const { title, message, option } = messages.REVIEW_SUBMISSION_CONFIRM
    setShowModalConfirmation({
      open: true,
      title,
      message,
      option,
      onClick: () => submission(),
      onClose: () => setShowModalConfirmation({ open: false }),
    })
  }

  const onClick = async () => {
    const firstIncompleteReviewPage = structure.firstIncompleteReviewPage

    // Check INCOMPLETE
    if (firstIncompleteReviewPage) {
      const { sectionCode, pageNumber } = firstIncompleteReviewPage

      replace(`${pathname}?activeSections=${sectionCode}`)
      scrollTo(`${sectionCode}P${pageNumber}`)
      setAttemptSubmission()
      return
    }

    // Check DECISION was made
    const decisionError = getAndSetDecisionError()
    if (decisionError) {
      showIncompleteSectionWarning()
      return
    }

    // Check review status != PENDING
    const { thisReview } = await getFullReviewStructureAsync()
    if (thisReview?.status === ReviewStatus.Pending) {
      showPendingReviewWarning()
      return
    }

    // Can SUBMIT
    showConfirmation()
  }

  const submission = async () => {
    try {
      await submitReview(structure, getDecision())
    } catch (e) {
      console.log(e)
      setShowModalConfirmation({ open: false })
      setSubmissionError(true)
    }
  }

  if (structure.thisReview?.status !== ReviewStatus.Draft) return null

  return (
    <Form.Field>
      <Button
        primary
        className={attemptSubmissionFailed ? 'alert wide-button' : 'wide-button'}
        onClick={() => onClick()}
        content={strings.BUTTON_REVIEW_SUBMIT}
      />
      {attemptSubmissionFailed && (
        <Label className="simple-label alert-text" content={messages.REVIEW_SUBMISSION_FAIL} />
      )}
      <ModalWarning {...showWarningModal} />
      <ModalConfirmation {...showModalConfirmation} />
    </Form.Field>
  )
}
export default ReviewSubmit
