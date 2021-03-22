import React, { useState } from 'react'
import { Button, Icon, ModalProps } from 'semantic-ui-react'
import { ModalWarning } from '../../components'
import ReviewComment from '../../components/Review/ReviewComment'
import ReviewDecision from '../../components/Review/ReviewDecision'
import strings from '../../utils/constants'
import { Decision, ReviewStatus } from '../../utils/generated/graphql'
import useGetDecisionOptions from '../../utils/hooks/useGetDecisionOptions'
import { useRouter } from '../../utils/hooks/useRouter'
import useSubmitReviewNEW from '../../utils/hooks/useSubmitReviewNEW'
import messages from '../../utils/messages'
import { AssignmentDetailsNEW, FullStructure } from '../../utils/types'

type ReviewSubmitProps = {
  structure: FullStructure
  reviewAssignment: AssignmentDetailsNEW
  scrollTo: (code: string) => void
}

const ReviewSubmit: React.FC<ReviewSubmitProps> = (props) => {
  const { structure } = props
  const thisReview = structure?.thisReview
  const reviewDecision = thisReview?.reviewDecision
  const {
    decisionOptions,
    getDecision,
    setDecision,
    getAndSetDecisionError,
    isDecisionError,
  } = useGetDecisionOptions(structure.canSubmitReviewAs, thisReview)

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ flexGrow: 1, marginRight: 30, marginLeft: 30 }}>
        <ReviewComment
          isEditable={thisReview?.status == ReviewStatus.Draft}
          reviewDecisionId={Number(reviewDecision?.id)}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ReviewDecision
          decisionOptions={decisionOptions}
          setDecision={setDecision}
          isDecisionError={isDecisionError}
          isEditable={thisReview?.status == ReviewStatus.Draft}
        />
        <Icon
          onClick={() =>
            getFile(
              `http://localhost:8080/generatedoc?templateType=${
                structure.info.typeCode
              }&submissionType=${getDecision()}`,
              structure
            )
          }
          size="big"
          style={{ margin: 5 }}
          name="file pdf outline"
        />
        <ReviewSubmitButton
          {...props}
          getDecision={getDecision}
          getAndSetDecisionError={getAndSetDecisionError}
        />
      </div>
    </div>
  )
}

type ReviewSubmitButtonProps = {
  getDecision: () => Decision
  getAndSetDecisionError: () => boolean
}

const ReviewSubmitButton: React.FC<ReviewSubmitProps & ReviewSubmitButtonProps> = ({
  scrollTo,
  structure,
  reviewAssignment,
  getDecision,
  getAndSetDecisionError,
}) => {
  const {
    location: { pathname },
    replace,
  } = useRouter()

  const [showWarningModal, setShowWarningModal] = useState<ModalProps>({ open: false })
  const submitReview = useSubmitReviewNEW(Number(structure.thisReview?.id))

  const showWarning = (message: {}, action: () => void) => {
    setShowWarningModal({
      open: true,
      ...message,
      onClick: () => {
        setShowWarningModal({ open: false })
        action()
      },
      onClose: () => setShowWarningModal({ open: false }),
    })
  }

  const onClick = () => {
    const firstIncompleteReviewPage = structure.firstIncompleteReviewPage

    // Check INCOMPLETE
    if (firstIncompleteReviewPage) {
      const { sectionCode, pageNumber } = firstIncompleteReviewPage

      replace(`${pathname}?activeSections=${sectionCode}`)

      // TODO add consolidator submission error
      const message = reviewAssignment.level === 1 ? messages.REVIEW_LEVEL1_SUBMISSION_FAIL : {}
      showWarning(message, () => scrollTo(`${sectionCode}P${pageNumber}`))
      return
    }

    // Check DECISION was made
    const decisionError = getAndSetDecisionError()
    if (decisionError) {
      const message = messages.REVIEW_DECISION_SET_FAIL
      showWarning(message, () => {})
      return
    }

    // Can SUBMIT
    /* TODO add submission modal, currently will submit even if ok is not pressed, also deal with localisation at the same time */
    const message = {
      title: 'Submitting Review',
      message: 'Are you sure',
      option: 'SUBMIT',
    }

    const action = async () => {
      try {
        await submitReview(structure, getDecision())
      } catch (e) {
        // TODO handle in UI
        console.log('Update review mutation failed', e)
      }
    }

    showWarning(message, action)
  }

  if (structure.thisReview?.status !== ReviewStatus.Draft) return null

  return (
    <div>
      <Button style={{ marginRight: 30 }} color="blue" onClick={onClick}>
        {strings.BUTTON_REVIEW_SUBMIT}
      </Button>
      <ModalWarning showModal={showWarningModal} />
      {/* TODO add submission modal */}
    </div>
  )
}
export default ReviewSubmit

const getFile = (url: any, data: any) => {
  let headers = new Headers()
  headers.append('Content-Type', 'application/json')
  console.log(data)
  fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data),
  })
    .then(async (res) => ({
      filename: `${data.info.serial}.pdf`,
      blob: await res.blob(),
    }))
    .then((resObj) => {
      // It is necessary to create a new blob object with mime-type explicitly set for all browsers except Chrome, but it works for Chrome too.
      const newBlob = new Blob([resObj.blob], { type: 'application/pdf' })

      // MS Edge and IE don't allow using a blob object directly as link href, instead it is necessary to use msSaveOrOpenBlob
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(newBlob)
      } else {
        // For other browsers: create a link pointing to the ObjectURL containing the blob.
        const objUrl = window.URL.createObjectURL(newBlob)

        let link = document.createElement('a')
        link.href = objUrl
        link.download = resObj.filename
        link.click()

        // For Firefox it is necessary to delay revoking the ObjectURL.
        setTimeout(() => {
          window.URL.revokeObjectURL(objUrl)
        }, 250)
      }
    })
    .catch((error) => {
      console.log('DOWNLOAD ERROR', error)
    })
}
